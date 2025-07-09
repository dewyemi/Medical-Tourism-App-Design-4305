import supabase from '../lib/supabase';

const TABLE_NAME = 'reviews_meditravel';

export const createReview = async (reviewData) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        ...reviewData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getDestinationReviews = async (destinationId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        user:user_id(id, email),
        profile:user_id(first_name, last_name, avatar_url)
      `)
      .eq('destination_id', destinationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching destination reviews:', error);
    throw error;
  }
};

export const getTreatmentReviews = async (treatmentId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        user:user_id(id, email),
        profile:user_id(first_name, last_name, avatar_url)
      `)
      .eq('treatment_id', treatmentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching treatment reviews:', error);
    throw error;
  }
};

export const getUserReviews = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        destination:destination_id(id, name, city, country),
        treatment:treatment_id(id, name, category)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(reviewData)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};