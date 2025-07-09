-- Assign admin role to the specified user
-- This migration should be run after the user has been created

-- First, let's create a function to safely assign admin role
CREATE OR REPLACE FUNCTION assign_admin_role_to_user(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    target_user_id UUID;
    role_exists BOOLEAN;
BEGIN
    -- Find the user by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Check if user exists
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found', user_email;
        RETURN FALSE;
    END IF;
    
    -- Check if user already has admin role
    SELECT EXISTS(
        SELECT 1 FROM user_roles_meditravel_x8f24k 
        WHERE user_id = target_user_id AND role = 'admin'
    ) INTO role_exists;
    
    IF role_exists THEN
        RAISE NOTICE 'User % already has admin role', user_email;
        RETURN TRUE;
    END IF;
    
    -- Assign admin role
    INSERT INTO user_roles_meditravel_x8f24k (user_id, role)
    VALUES (target_user_id, 'admin');
    
    RAISE NOTICE 'Admin role assigned to user %', user_email;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assign admin role to the specified user
SELECT assign_admin_role_to_user('dewyemi+c@icloud.com');

-- Add analytics permission for all users (needed for analytics page)
INSERT INTO role_permissions_meditravel_x8f24k (role, permission_id)
VALUES 
    ('patient', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'analytics:read'))
ON CONFLICT (role, permission_id) DO NOTHING;