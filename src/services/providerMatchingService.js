import supabase from '../lib/supabase';

/**
 * Find matching healthcare providers for a specific treatment
 */
export const findMatchingProviders = async (treatmentId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Call the provider matching function
    const { data, error } = await supabase.rpc(
      'find_matching_providers',
      {
        p_user_id: user.id,
        p_treatment_id: treatmentId
      }
    );
    
    if (error) throw error;
    
    // Fetch additional provider details
    const providerIds = data.map(p => p.provider_id);
    
    // Get provider profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('provider_profiles_emirafrik')
      .select('*')
      .in('user_id', providerIds);
      
    if (profilesError) throw profilesError;
    
    // Get provider reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('provider_reviews_emirafrik')
      .select('provider_id, overall_rating')
      .in('provider_id', providerIds);
      
    if (reviewsError) throw reviewsError;
    
    // Calculate average ratings
    const avgRatings = {};
    reviews?.forEach(review => {
      if (!avgRatings[review.provider_id]) {
        avgRatings[review.provider_id] = {
          sum: 0,
          count: 0
        };
      }
      
      avgRatings[review.provider_id].sum += review.overall_rating;
      avgRatings[review.provider_id].count += 1;
    });
    
    // Combine all data
    return data.map(provider => {
      const profile = profiles?.find(p => p.user_id === provider.provider_id) || null;
      const rating = avgRatings[provider.provider_id] 
        ? (avgRatings[provider.provider_id].sum / avgRatings[provider.provider_id].count).toFixed(1)
        : null;
        
      return {
        ...provider,
        profile,
        avg_rating: rating,
        review_count: avgRatings[provider.provider_id]?.count || 0
      };
    });
  } catch (error) {
    console.error('Error finding matching providers:', error);
    throw error;
  }
};

/**
 * Get detailed provider profile and expertise
 */
export const getProviderProfile = async (providerId) => {
  try {
    // Get basic user profile
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles_meditravel')
      .select('*')
      .eq('id', providerId)
      .single();
      
    if (userError) throw userError;
    
    // Get enhanced provider profile
    const { data: providerProfile, error: profileError } = await supabase
      .from('provider_profiles_emirafrik')
      .select('*')
      .eq('user_id', providerId)
      .single();
      
    // Get provider expertise
    const { data: expertise, error: expertiseError } = await supabase
      .from('provider_expertise_emirafrik')
      .select(`
        *,
        treatment:treatment_id(id, name, category)
      `)
      .eq('provider_id', providerId);
      
    // Get provider availability
    const { data: availability, error: availabilityError } = await supabase
      .from('provider_availability_emirafrik')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_available', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });
      
    // Get provider reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('provider_reviews_emirafrik')
      .select(`
        *,
        user:user_id(email),
        user_profile:user_id(first_name, last_name, avatar_url)
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
      
    // Get provider teams
    const { data: teams, error: teamsError } = await supabase
      .from('provider_teams_emirafrik')
      .select('*')
      .contains('team_members', [providerId]);
      
    // Calculate average ratings
    let avgRating = 0;
    let totalReviews = 0;
    
    if (reviews && reviews.length > 0) {
      totalReviews = reviews.length;
      avgRating = reviews.reduce((sum, review) => sum + review.overall_rating, 0) / totalReviews;
    }
    
    // Combine all data
    return {
      basic_profile: userProfile,
      provider_profile: providerProfile || null,
      expertise: expertise || [],
      availability: availability || [],
      reviews: reviews || [],
      teams: teams || [],
      statistics: {
        avg_rating: avgRating.toFixed(1),
        review_count: totalReviews,
        expertise_count: expertise?.length || 0,
        team_count: teams?.length || 0
      }
    };
  } catch (error) {
    console.error('Error getting provider profile:', error);
    throw error;
  }
};

/**
 * Request an appointment with a provider
 */
export const requestProviderAppointment = async (providerId, treatmentId, preferredDate, notes) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Create a booking first
    const { data: booking, error: bookingError } = await supabase
      .from('bookings_meditravel')
      .insert({
        user_id: user.id,
        treatment_id: treatmentId,
        booking_date: preferredDate,
        status: 'pending',
        notes: notes
      })
      .select()
      .single();
      
    if (bookingError) throw bookingError;
    
    // Create an appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments_emirafrik')
      .insert({
        user_id: user.id,
        provider_id: providerId,
        booking_id: booking.id,
        appointment_type: 'consultation',
        scheduled_date: preferredDate,
        status: 'scheduled',
        appointment_notes: notes
      })
      .select()
      .single();
      
    if (appointmentError) throw appointmentError;
    
    // Create a patient-provider match
    const { data: match, error: matchError } = await supabase
      .from('patient_provider_matching_emirafrik')
      .insert({
        user_id: user.id,
        provider_id: providerId,
        treatment_id: treatmentId,
        matching_score: 85.0, // This would normally be calculated
        status: 'pending',
        notes: 'Appointment requested by patient'
      })
      .select()
      .single();
      
    if (matchError) throw matchError;
    
    return {
      booking,
      appointment,
      match
    };
  } catch (error) {
    console.error('Error requesting provider appointment:', error);
    throw error;
  }
};

/**
 * Submit a review for a provider
 */
export const submitProviderReview = async (reviewData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('provider_reviews_emirafrik')
      .insert({
        user_id: user.id,
        provider_id: reviewData.provider_id,
        booking_id: reviewData.booking_id,
        treatment_id: reviewData.treatment_id,
        overall_rating: reviewData.overall_rating,
        communication_rating: reviewData.communication_rating,
        punctuality_rating: reviewData.punctuality_rating,
        knowledge_rating: reviewData.knowledge_rating,
        bedside_manner_rating: reviewData.bedside_manner_rating,
        facility_rating: reviewData.facility_rating,
        staff_rating: reviewData.staff_rating,
        wait_time_rating: reviewData.wait_time_rating,
        review_text: reviewData.review_text,
        would_recommend: reviewData.would_recommend,
        is_anonymous: reviewData.is_anonymous || false
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error submitting provider review:', error);
    throw error;
  }
};