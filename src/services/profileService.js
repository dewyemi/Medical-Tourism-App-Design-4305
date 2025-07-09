import supabase from '../lib/supabase';

const TABLE_NAME = 'user_profiles_meditravel';

export const getUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"

    // If no profile exists, return a default structure
    if (!data) {
      return {
        id: user.id,
        first_name: '',
        last_name: '',
        email: user.email,
        avatar_url: null
      };
    }

    return { ...data, email: user.email };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const createOrUpdateProfile = async (profileData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from(TABLE_NAME)
      .select('id')
      .eq('id', user.id)
      .single();

    let result;

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert({
          id: user.id,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return { ...result, email: user.email };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateAvatar = async (filePath) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update the avatar URL in the profile
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        avatar_url: filePath,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
};

export const uploadAvatarFile = async (file) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    // Update the profile with the new avatar URL
    await updateAvatar(data.publicUrl);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar file:', error);
    throw error;
  }
};