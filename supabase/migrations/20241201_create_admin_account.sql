-- Create the administrator account for dewyemi+a@icloud.com
-- This migration creates the admin user if they don't exist and assigns admin role

-- First create a function to create admin user if they don't exist
CREATE OR REPLACE FUNCTION create_admin_user(
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_password TEXT
) RETURNS UUID AS $$
DECLARE
    user_id UUID;
    existing_user_id UUID;
BEGIN
    -- Check if user already exists
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = p_email;
    
    IF existing_user_id IS NOT NULL THEN
        -- User exists, just assign admin role if not already assigned
        INSERT INTO user_roles_meditravel_x8f24k (user_id, role)
        VALUES (existing_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin role assigned to existing user %', p_email;
        RETURN existing_user_id;
    END IF;
    
    -- User doesn't exist, create a placeholder entry
    -- Note: In production, user should be created via Supabase Auth
    -- This is a data setup for development/testing
    
    RAISE NOTICE 'Please create user % manually via Supabase Auth with password: %', p_email, p_password;
    RAISE NOTICE 'First Name: %, Last Name: %', p_first_name, p_last_name;
    RAISE NOTICE 'Once created, run: SELECT assign_admin_role_to_user(''%'');', p_email;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create/assign admin role for the specified user
SELECT create_admin_user(
    'dewyemi+a@icloud.com',
    'Ola',
    'Oye',
    'Desktop@123'
);

-- Also create user profiles table if it doesn't exist for storing extended user info
CREATE TABLE IF NOT EXISTS user_profiles_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    country VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    emergency_contact JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles_emirafrik ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles_emirafrik
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles_emirafrik
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles_emirafrik
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles_emirafrik
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles_meditravel_x8f24k WHERE role = 'admin'
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles_emirafrik (user_id, first_name, last_name)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_profile_created ON auth.users;
CREATE TRIGGER on_auth_user_profile_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();