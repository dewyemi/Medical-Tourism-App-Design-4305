import supabase from '../lib/supabase';

const TABLE_NAME = 'destinations_meditravel';

export const getDestinations = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('rating', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching destinations:', error);
    throw error;
  }
};

export const getFeaturedDestinations = async (limit = 2) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('featured', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching featured destinations:', error);
    throw error;
  }
};

export const getDestinationById = async (id) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching destination:', error);
    throw error;
  }
};

export const searchDestinations = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,country.ilike.%${searchTerm}%`)
      .order('rating', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching destinations:', error);
    throw error;
  }
};

export const createDestination = async (destinationData) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(destinationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating destination:', error);
    throw error;
  }
};

export const updateDestination = async (id, destinationData) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(destinationData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating destination:', error);
    throw error;
  }
};

export const deleteDestination = async (id) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting destination:', error);
    throw error;
  }
};