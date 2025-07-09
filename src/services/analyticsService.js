import supabase from '../lib/supabase';

// User metrics
export const getUserMetrics = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('analytics_user_metrics_meditravel')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no metrics exist yet, calculate them on the fly
      if (error.code === 'PGRST116') {
        return await calculateUserMetrics(user.id);
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    throw error;
  }
};

export const calculateUserMetrics = async (userId) => {
  try {
    // Get all user bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings_meditravel')
      .select(`
        id, status, booking_date, created_at,
        destination:destination_id(id, country, savings_percentage)
      `)
      .eq('user_id', userId);

    if (bookingsError) throw bookingsError;

    // Get all user reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews_meditravel')
      .select('rating')
      .eq('user_id', userId);

    if (reviewsError) throw reviewsError;

    // Get all user payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments_meditravel')
      .select('amount, payment_status')
      .eq('user_id', userId)
      .eq('payment_status', 'completed');

    if (paymentsError) throw paymentsError;

    // Calculate metrics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    // Calculate total spent
    const totalSpent = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
    
    // Calculate countries visited
    const uniqueCountries = new Set(
      bookings
        .filter(b => b.status === 'completed')
        .map(b => b.destination?.country)
        .filter(Boolean)
    );
    
    // Calculate average rating given
    const ratings = reviews.map(r => r.rating).filter(Boolean);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : null;
    
    // Find last booking date
    const bookingDates = bookings
      .map(b => new Date(b.booking_date || b.created_at))
      .filter(Boolean);
    const lastBookingDate = bookingDates.length > 0 
      ? new Date(Math.max(...bookingDates)) 
      : null;
    
    // Calculate savings amount (based on savings percentage from destinations)
    let savingsAmount = 0;
    bookings.forEach(booking => {
      if (booking.destination?.savings_percentage) {
        const savingsPercentage = parseFloat(booking.destination.savings_percentage.replace('%', '')) / 100;
        // Assume an average treatment cost of $10,000 for calculation
        const estimatedOriginalCost = 10000;
        savingsAmount += estimatedOriginalCost * savingsPercentage;
      }
    });

    // Prepare metrics object
    const metrics = {
      user_id: userId,
      total_bookings: totalBookings,
      completed_bookings: completedBookings,
      cancelled_bookings: cancelledBookings,
      total_spent: totalSpent,
      savings_amount: savingsAmount,
      countries_visited: uniqueCountries.size,
      avg_rating: avgRating,
      last_booking_date: lastBookingDate,
      updated_at: new Date().toISOString()
    };

    return metrics;
  } catch (error) {
    console.error('Error calculating user metrics:', error);
    throw error;
  }
};

// Destination metrics
export const getDestinationMetrics = async (destinationId) => {
  try {
    const { data, error } = await supabase
      .from('analytics_destination_metrics_meditravel')
      .select('*')
      .eq('destination_id', destinationId)
      .single();

    if (error) {
      // If no metrics exist yet, calculate them on the fly
      if (error.code === 'PGRST116') {
        return await calculateDestinationMetrics(destinationId);
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching destination metrics for ${destinationId}:`, error);
    throw error;
  }
};

export const calculateDestinationMetrics = async (destinationId) => {
  try {
    // Get all bookings for this destination
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings_meditravel')
      .select(`
        id, status, booking_date, created_at, user_id,
        treatment:treatment_id(id, name, category)
      `)
      .eq('destination_id', destinationId);

    if (bookingsError) throw bookingsError;

    // Get all reviews for this destination
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews_meditravel')
      .select('rating, user_id')
      .eq('destination_id', destinationId);

    if (reviewsError) throw reviewsError;

    // Calculate metrics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    // Calculate average rating
    const ratings = reviews.map(r => r.rating).filter(Boolean);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : null;
    
    // Calculate popular treatments
    const treatmentCounts = {};
    bookings.forEach(booking => {
      if (booking.treatment) {
        const treatmentId = booking.treatment.id;
        const treatmentName = booking.treatment.name;
        const treatmentCategory = booking.treatment.category;
        
        if (!treatmentCounts[treatmentId]) {
          treatmentCounts[treatmentId] = {
            id: treatmentId,
            name: treatmentName,
            category: treatmentCategory,
            count: 0
          };
        }
        treatmentCounts[treatmentId].count++;
      }
    });
    
    const popularTreatments = Object.values(treatmentCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate peak booking months
    const bookingMonths = {};
    bookings.forEach(booking => {
      if (booking.booking_date) {
        const date = new Date(booking.booking_date);
        const month = date.getMonth();
        bookingMonths[month] = (bookingMonths[month] || 0) + 1;
      }
    });
    
    const peakBookingMonths = Object.entries(bookingMonths)
      .map(([month, count]) => ({
        month: parseInt(month),
        count
      }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate user demographics
    const uniqueUsers = new Set(bookings.map(b => b.user_id));
    const userCount = uniqueUsers.size;
    
    // Get user profiles for demographic information
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles_meditravel')
      .select('country, date_of_birth')
      .in('id', Array.from(uniqueUsers));

    if (profilesError) throw profilesError;
    
    // Process demographics
    const countries = {};
    let ageGroups = {
      'under25': 0,
      '25to34': 0,
      '35to44': 0,
      '45to54': 0,
      '55plus': 0,
      'unknown': 0
    };
    
    userProfiles.forEach(profile => {
      // Process countries
      if (profile.country) {
        countries[profile.country] = (countries[profile.country] || 0) + 1;
      }
      
      // Process age groups
      if (profile.date_of_birth) {
        const birthDate = new Date(profile.date_of_birth);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        
        if (age < 25) ageGroups.under25++;
        else if (age < 35) ageGroups['25to34']++;
        else if (age < 45) ageGroups['35to44']++;
        else if (age < 55) ageGroups['45to54']++;
        else ageGroups['55plus']++;
      } else {
        ageGroups.unknown++;
      }
    });
    
    const topCountries = Object.entries(countries)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const userDemographics = {
      userCount,
      topCountries,
      ageGroups
    };

    // Prepare metrics object
    const metrics = {
      destination_id: destinationId,
      total_bookings: totalBookings,
      completed_bookings: completedBookings,
      cancelled_bookings: cancelledBookings,
      avg_rating: avgRating,
      popular_treatments: popularTreatments,
      peak_booking_months: peakBookingMonths,
      user_demographics: userDemographics,
      updated_at: new Date().toISOString()
    };

    return metrics;
  } catch (error) {
    console.error(`Error calculating destination metrics for ${destinationId}:`, error);
    throw error;
  }
};

// Treatment metrics
export const getTreatmentMetrics = async (treatmentId) => {
  try {
    const { data, error } = await supabase
      .from('analytics_treatment_metrics_meditravel')
      .select('*')
      .eq('treatment_id', treatmentId)
      .single();

    if (error) {
      // If no metrics exist yet, calculate them on the fly
      if (error.code === 'PGRST116') {
        return await calculateTreatmentMetrics(treatmentId);
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching treatment metrics for ${treatmentId}:`, error);
    throw error;
  }
};

export const calculateTreatmentMetrics = async (treatmentId) => {
  try {
    // Get all bookings for this treatment
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings_meditravel')
      .select(`
        id, status, booking_date, created_at, user_id,
        destination:destination_id(id, name, city, country)
      `)
      .eq('treatment_id', treatmentId);

    if (bookingsError) throw bookingsError;

    // Get all reviews for this treatment
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews_meditravel')
      .select('rating, user_id')
      .eq('treatment_id', treatmentId);

    if (reviewsError) throw reviewsError;

    // Calculate metrics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    // Calculate average rating
    const ratings = reviews.map(r => r.rating).filter(Boolean);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : null;
    
    // Calculate popular destinations
    const destinationCounts = {};
    bookings.forEach(booking => {
      if (booking.destination) {
        const destId = booking.destination.id;
        const destName = booking.destination.name;
        const destLocation = `${booking.destination.city}, ${booking.destination.country}`;
        
        if (!destinationCounts[destId]) {
          destinationCounts[destId] = {
            id: destId,
            name: destName,
            location: destLocation,
            count: 0
          };
        }
        destinationCounts[destId].count++;
      }
    });
    
    const popularDestinations = Object.values(destinationCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate user demographics
    const uniqueUsers = new Set(bookings.map(b => b.user_id));
    const userCount = uniqueUsers.size;
    
    // Get user profiles for demographic information
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles_meditravel')
      .select('country, date_of_birth, gender')
      .in('id', Array.from(uniqueUsers));

    if (profilesError) throw profilesError;
    
    // Process demographics
    const countries = {};
    const genders = {};
    let ageGroups = {
      'under25': 0,
      '25to34': 0,
      '35to44': 0,
      '45to54': 0,
      '55plus': 0,
      'unknown': 0
    };
    
    userProfiles.forEach(profile => {
      // Process countries
      if (profile.country) {
        countries[profile.country] = (countries[profile.country] || 0) + 1;
      }
      
      // Process genders
      if (profile.gender) {
        genders[profile.gender] = (genders[profile.gender] || 0) + 1;
      }
      
      // Process age groups
      if (profile.date_of_birth) {
        const birthDate = new Date(profile.date_of_birth);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        
        if (age < 25) ageGroups.under25++;
        else if (age < 35) ageGroups['25to34']++;
        else if (age < 45) ageGroups['35to44']++;
        else if (age < 55) ageGroups['45to54']++;
        else ageGroups['55plus']++;
      } else {
        ageGroups.unknown++;
      }
    });
    
    const topCountries = Object.entries(countries)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const userDemographics = {
      userCount,
      topCountries,
      ageGroups,
      genders
    };

    // Prepare metrics object
    const metrics = {
      treatment_id: treatmentId,
      total_bookings: totalBookings,
      completed_bookings: completedBookings,
      cancelled_bookings: cancelledBookings,
      avg_rating: avgRating,
      popular_destinations: popularDestinations,
      user_demographics: userDemographics,
      updated_at: new Date().toISOString()
    };

    return metrics;
  } catch (error) {
    console.error(`Error calculating treatment metrics for ${treatmentId}:`, error);
    throw error;
  }
};

// Platform-wide analytics
export const getPlatformMetrics = async () => {
  try {
    // Get total user count
    const { count: userCount, error: userError } = await supabase
      .from('user_profiles_meditravel')
      .select('id', { count: 'exact', head: true });

    if (userError) throw userError;

    // Get booking stats
    const { data: bookingStats, error: bookingError } = await supabase
      .rpc('get_booking_stats', {});

    const bookingData = bookingError ? {
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0
    } : bookingStats[0];

    // Get top destinations
    const { data: topDestinations, error: destError } = await supabase
      .from('destinations_meditravel')
      .select('id, name, city, country, rating')
      .order('rating', { ascending: false })
      .limit(5);

    // Get top treatments
    const { data: topTreatments, error: treatmentError } = await supabase
      .from('treatments_meditravel')
      .select('id, name, category, procedure_count')
      .order('procedure_count', { ascending: false })
      .limit(5);

    // Get recent reviews
    const { data: recentReviews, error: reviewError } = await supabase
      .from('reviews_meditravel')
      .select(`
        id, rating, comment, created_at,
        user:user_id(email),
        profile:user_id(first_name, last_name, avatar_url),
        destination:destination_id(name),
        treatment:treatment_id(name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate average platform rating
    const { data: avgRatingData, error: ratingError } = await supabase
      .rpc('get_average_platform_rating', {});

    const avgRating = ratingError ? null : avgRatingData[0]?.avg_rating;

    // Monthly booking trends
    const { data: monthlyTrends, error: trendsError } = await supabase
      .rpc('get_monthly_booking_trends', { months_back: 12 });

    // Prepare platform metrics
    return {
      user_count: userCount,
      booking_stats: bookingData,
      top_destinations: topDestinations || [],
      top_treatments: topTreatments || [],
      recent_reviews: recentReviews || [],
      avg_platform_rating: avgRating,
      monthly_trends: monthlyTrends || [],
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching platform metrics:', error);
    throw error;
  }
};

// Fallback implementations for RPC functions that might not exist yet
// These would normally be implemented as stored procedures in the database
export const fallbackCalculations = {
  getBookingStats: async () => {
    const { data, error } = await supabase
      .from('bookings_meditravel')
      .select('status');
    
    if (error) throw error;
    
    const stats = {
      total: data.length,
      completed: data.filter(b => b.status === 'completed').length,
      pending: data.filter(b => b.status === 'pending').length,
      cancelled: data.filter(b => b.status === 'cancelled').length,
    };
    
    return [stats];
  },
  
  getAveragePlatformRating: async () => {
    const { data, error } = await supabase
      .from('reviews_meditravel')
      .select('rating');
    
    if (error) throw error;
    
    const ratings = data.map(r => r.rating).filter(Boolean);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : null;
    
    return [{ avg_rating: avgRating }];
  },
  
  getMonthlyBookingTrends: async (monthsBack = 12) => {
    const { data, error } = await supabase
      .from('bookings_meditravel')
      .select('created_at');
    
    if (error) throw error;
    
    // Generate last N months
    const trends = [];
    const today = new Date();
    
    for (let i = monthsBack - 1; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = month.toISOString().substring(0, 7); // YYYY-MM format
      
      trends.push({
        month: monthStr,
        count: 0
      });
    }
    
    // Count bookings by month
    data.forEach(booking => {
      const bookingMonth = booking.created_at.substring(0, 7);
      const trend = trends.find(t => t.month === bookingMonth);
      if (trend) trend.count++;
    });
    
    return trends;
  }
};