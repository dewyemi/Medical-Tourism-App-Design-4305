import supabase from '../lib/supabase';

const TABLE_NAME = 'treatments_meditravel';

export const getTreatments = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('procedure_count', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching treatments:', error);
    throw error;
  }
};

export const getTreatmentById = async (id) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching treatment:', error);
    throw error;
  }
};

export const getTreatmentsByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('category', category)
      .order('procedure_count', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching treatments by category:', error);
    throw error;
  }
};

export const createTreatment = async (treatmentData) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(treatmentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating treatment:', error);
    throw error;
  }
};

export const updateTreatment = async (id, treatmentData) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(treatmentData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating treatment:', error);
    throw error;
  }
};

export const deleteTreatment = async (id) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting treatment:', error);
    throw error;
  }
};