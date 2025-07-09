import supabase from '../lib/supabase';

const TABLE_NAME = 'payments_meditravel';

export const createPayment = async (paymentData) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        ...paymentData,
        user_id: user.id,
        payment_status: 'pending',
        payment_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const getUserPayments = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        booking:booking_id(id, booking_date, status,
          destination:destination_id(name, city, country),
          treatment:treatment_id(name, category))
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user payments:', error);
    throw error;
  }
};

export const getPaymentById = async (paymentId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        booking:booking_id(id, booking_date, status,
          destination:destination_id(name, city, country),
          treatment:treatment_id(name, category))
      `)
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw error;
  }
};

export const getBookingPayments = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching booking payments:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ 
        payment_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};