-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles_meditravel_x8f24k (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'admin', 'healthcare_provider')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on the table
ALTER TABLE user_roles_meditravel_x8f24k ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own roles" 
  ON user_roles_meditravel_x8f24k
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can create roles" 
  ON user_roles_meditravel_x8f24k
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles_meditravel_x8f24k WHERE role = 'admin'
    ) OR 
    -- Allow initial admin creation
    NOT EXISTS (SELECT 1 FROM user_roles_meditravel_x8f24k WHERE role = 'admin')
  );

CREATE POLICY "Only admins can update roles" 
  ON user_roles_meditravel_x8f24k
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles_meditravel_x8f24k WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete roles" 
  ON user_roles_meditravel_x8f24k
  FOR DELETE 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles_meditravel_x8f24k WHERE role = 'admin'
    )
  );

-- Create function to assign default role on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles_meditravel_x8f24k (user_id, role)
  VALUES (NEW.id, 'patient');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically assign default role
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create permissions table for fine-grained permissions
CREATE TABLE IF NOT EXISTS permissions_meditravel_x8f24k (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions_meditravel_x8f24k (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'admin', 'healthcare_provider')),
  permission_id UUID NOT NULL REFERENCES permissions_meditravel_x8f24k(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Enable RLS on permissions tables
ALTER TABLE permissions_meditravel_x8f24k ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions_meditravel_x8f24k ENABLE ROW LEVEL SECURITY;

-- Create policies for permissions tables
CREATE POLICY "Users can view permissions" 
  ON permissions_meditravel_x8f24k
  FOR SELECT 
  TO authenticated;

CREATE POLICY "Users can view role permissions" 
  ON role_permissions_meditravel_x8f24k
  FOR SELECT 
  TO authenticated;

-- Insert default permissions
INSERT INTO permissions_meditravel_x8f24k (name, description)
VALUES 
  ('bookings:create', 'Create new bookings'),
  ('bookings:read', 'View bookings'),
  ('bookings:update', 'Update bookings'),
  ('bookings:delete', 'Delete bookings'),
  ('users:read', 'View user details'),
  ('users:update', 'Update user details'),
  ('users:delete', 'Delete users'),
  ('analytics:read', 'View analytics data'),
  ('analytics:manage', 'Manage analytics settings'),
  ('destinations:create', 'Create destinations'),
  ('destinations:update', 'Update destinations'),
  ('destinations:delete', 'Delete destinations'),
  ('treatments:create', 'Create treatments'),
  ('treatments:update', 'Update treatments'),
  ('treatments:delete', 'Delete treatments')
ON CONFLICT (name) DO NOTHING;

-- Assign default permissions to roles
INSERT INTO role_permissions_meditravel_x8f24k (role, permission_id)
VALUES 
  -- Patient permissions
  ('patient', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'bookings:create')),
  ('patient', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'bookings:read')),
  ('patient', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'bookings:update')),
  ('patient', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'users:read')),
  ('patient', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'users:update')),
  
  -- Admin permissions (all permissions)
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'bookings:create')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'bookings:read')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'bookings:update')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'bookings:delete')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'users:read')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'users:update')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'users:delete')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'analytics:read')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'analytics:manage')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'destinations:create')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'destinations:update')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'destinations:delete')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'treatments:create')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'treatments:update')),
  ('admin', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'treatments:delete')),
  
  -- Healthcare provider permissions
  ('healthcare_provider', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'bookings:read')),
  ('healthcare_provider', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'bookings:update')),
  ('healthcare_provider', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'users:read')),
  ('healthcare_provider', (SELECT id FROM permissions_meditravel_x8f24k WHERE name = 'analytics:read'))
ON CONFLICT (role, permission_id) DO NOTHING;

-- Create function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(
  user_id UUID,
  permission_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_roles_meditravel_x8f24k ur
    JOIN role_permissions_meditravel_x8f24k rp ON ur.role = rp.role
    JOIN permissions_meditravel_x8f24k p ON rp.permission_id = p.id
    WHERE ur.user_id = user_has_permission.user_id
    AND p.name = permission_name
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all permissions for a user
CREATE OR REPLACE FUNCTION public.get_user_permissions(
  lookup_user_id UUID
) RETURNS TABLE (permission TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.name
  FROM user_roles_meditravel_x8f24k ur
  JOIN role_permissions_meditravel_x8f24k rp ON ur.role = rp.role
  JOIN permissions_meditravel_x8f24k p ON rp.permission_id = p.id
  WHERE ur.user_id = lookup_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all roles for a user
CREATE OR REPLACE FUNCTION public.get_user_roles(
  lookup_user_id UUID
) RETURNS TABLE (role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT ur.role
  FROM user_roles_meditravel_x8f24k ur
  WHERE ur.user_id = lookup_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;