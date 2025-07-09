import supabase from '../lib/supabase';

const TABLE_NAME = 'provider_applications_meditravel';

export const submitProviderApplication = async (applicationData) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        ...applicationData,
        user_id: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error submitting provider application:', error);
    throw error;
  }
};

export const getProviderApplication = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching provider application:', error);
    throw error;
  }
};

export const updateProviderApplication = async (applicationId, updates) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating provider application:', error);
    throw error;
  }
};