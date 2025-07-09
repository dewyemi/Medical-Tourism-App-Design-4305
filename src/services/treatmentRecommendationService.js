import supabase from '../lib/supabase';

/**
 * Get treatment recommendations based on patient preferences and condition
 */
export const getTreatmentRecommendations = async (condition, symptoms = [], severity = 'moderate') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get patient preferences if they exist
    const { data: preferences } = await supabase
      .from('patient_treatment_preferences_emirafrik')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    // Call the recommendation function
    const { data, error } = await supabase.rpc(
      'get_treatment_recommendations',
      {
        p_user_id: user.id,
        p_condition: condition,
        p_symptoms: symptoms,
        p_severity: severity,
        p_budget_max: preferences?.budget_max || null
      }
    );
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting treatment recommendations:', error);
    throw error;
  }
};

/**
 * Save patient treatment preferences
 */
export const savePatientPreferences = async (preferences) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if preferences already exist
    const { data: existingPrefs } = await supabase
      .from('patient_treatment_preferences_emirafrik')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (existingPrefs) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('patient_treatment_preferences_emirafrik')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from('patient_treatment_preferences_emirafrik')
        .insert({
          user_id: user.id,
          ...preferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error saving patient preferences:', error);
    throw error;
  }
};

/**
 * Get detailed information about a treatment
 */
export const getTreatmentDetails = async (treatmentId) => {
  try {
    // Get basic treatment info
    const { data: treatment, error: treatmentError } = await supabase
      .from('treatments_meditravel')
      .select('*')
      .eq('id', treatmentId)
      .single();
      
    if (treatmentError) throw treatmentError;
    
    // Get additional treatment details
    const { data: details, error: detailsError } = await supabase
      .from('treatment_details_emirafrik')
      .select('*')
      .eq('treatment_id', treatmentId)
      .single();
      
    // Get pricing information across destinations
    const { data: pricing, error: pricingError } = await supabase
      .from('treatment_pricing_emirafrik')
      .select(`
        *,
        destination:destination_id(id, name, city, country)
      `)
      .eq('treatment_id', treatmentId);
    
    // Get reviews for this treatment
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews_meditravel')
      .select(`
        *,
        user:user_id(id, email),
        profile:user_id(first_name, last_name, avatar_url),
        detailed_review:id(*)
      `)
      .eq('treatment_id', treatmentId)
      .order('created_at', { ascending: false });
    
    // Combine all data
    return {
      ...treatment,
      details: details || null,
      pricing: pricing || [],
      reviews: reviews || []
    };
  } catch (error) {
    console.error('Error getting treatment details:', error);
    throw error;
  }
};

/**
 * Compare multiple treatments
 */
export const compareTreatments = async (treatmentIds) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get basic information for all treatments
    const { data: treatments, error: treatmentsError } = await supabase
      .from('treatments_meditravel')
      .select('*')
      .in('id', treatmentIds);
      
    if (treatmentsError) throw treatmentsError;
    
    // Get detailed information for all treatments
    const { data: details, error: detailsError } = await supabase
      .from('treatment_details_emirafrik')
      .select('*')
      .in('treatment_id', treatmentIds);
      
    // Get pricing information for all treatments
    const { data: pricing, error: pricingError } = await supabase
      .from('treatment_pricing_emirafrik')
      .select(`
        *,
        destination:destination_id(id, name, city, country)
      `)
      .in('treatment_id', treatmentIds);
    
    // Create a comparison record
    const { data: comparison, error: comparisonError } = await supabase
      .from('treatment_comparisons_emirafrik')
      .insert({
        user_id: user.id,
        treatment_ids: treatmentIds,
        comparison_data: {
          timestamp: new Date().toISOString(),
          criteria: ['cost', 'recovery_time', 'success_rate', 'risk_level']
        }
      })
      .select()
      .single();
    
    // Organize the comparison data
    const comparisonData = treatments.map(treatment => {
      const treatmentDetails = details?.find(d => d.treatment_id === treatment.id) || null;
      const treatmentPricing = pricing?.filter(p => p.treatment_id === treatment.id) || [];
      
      return {
        id: treatment.id,
        name: treatment.name,
        category: treatment.category,
        description: treatment.description,
        success_rate: treatmentDetails?.success_rate,
        risk_level: treatmentDetails?.risk_level,
        recovery_time: treatmentDetails ? 
          `${treatmentDetails.recovery_time_min || 'N/A'} - ${treatmentDetails.recovery_time_max || 'N/A'} days` : 
          'Unknown',
        pricing: treatmentPricing.map(p => ({
          destination: p.destination.name,
          price: p.base_price,
          currency: p.currency
        })),
        min_price: treatmentPricing.length > 0 ? 
          Math.min(...treatmentPricing.map(p => p.base_price)) : 
          null,
        contraindications: treatmentDetails?.contraindications || [],
        side_effects: treatmentDetails?.common_side_effects || []
      };
    });
    
    return {
      comparison_id: comparison.id,
      treatments: comparisonData
    };
  } catch (error) {
    console.error('Error comparing treatments:', error);
    throw error;
  }
};

/**
 * Submit a detailed treatment review
 */
export const submitDetailedReview = async (reviewData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // First, create the basic review
    const { data: review, error: reviewError } = await supabase
      .from('reviews_meditravel')
      .insert({
        user_id: user.id,
        treatment_id: reviewData.treatment_id,
        destination_id: reviewData.destination_id,
        rating: reviewData.overall_rating,
        comment: reviewData.comment
      })
      .select()
      .single();
      
    if (reviewError) throw reviewError;
    
    // Then, create the detailed review
    const { data: detailedReview, error: detailedError } = await supabase
      .from('treatment_detailed_reviews_emirafrik')
      .insert({
        review_id: review.id,
        effectiveness_rating: reviewData.effectiveness_rating,
        pain_level_rating: reviewData.pain_level_rating,
        recovery_time_rating: reviewData.recovery_time_rating,
        side_effects_severity: reviewData.side_effects_severity,
        value_for_money_rating: reviewData.value_for_money_rating,
        hospital_quality_rating: reviewData.hospital_quality_rating,
        staff_care_rating: reviewData.staff_care_rating,
        would_recommend: reviewData.would_recommend,
        outcome_satisfaction: reviewData.outcome_satisfaction,
        specific_benefits: reviewData.specific_benefits || [],
        specific_drawbacks: reviewData.specific_drawbacks || []
      })
      .select()
      .single();
      
    if (detailedError) throw detailedError;
    
    return {
      ...review,
      detailed_review: detailedReview
    };
  } catch (error) {
    console.error('Error submitting detailed review:', error);
    throw error;
  }
};