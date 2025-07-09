import supabase from '../lib/supabase';

/**
 * Fetches all available roles
 */
export const getAllRoles = async () => {
  try {
    // Since we have a fixed set of roles, we can return them directly
    return ['patient', 'admin', 'healthcare_provider'];
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

/**
 * Fetches all available permissions
 */
export const getAllPermissions = async () => {
  try {
    const { data, error } = await supabase
      .from('permissions_meditravel_x8f24k')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
};

/**
 * Fetches all permissions for a specific role
 */
export const getRolePermissions = async (role) => {
  try {
    const { data, error } = await supabase
      .from('role_permissions_meditravel_x8f24k')
      .select(`
        permission_id,
        permission:permission_id(id, name, description)
      `)
      .eq('role', role);
      
    if (error) throw error;
    
    // Extract permission details from the nested structure
    return data.map(item => item.permission);
  } catch (error) {
    console.error(`Error fetching permissions for role ${role}:`, error);
    throw error;
  }
};

/**
 * Assigns a role to a user
 */
export const assignRoleToUser = async (userId, role) => {
  try {
    const { data, error } = await supabase
      .from('user_roles_meditravel_x8f24k')
      .insert({ user_id: userId, role })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error assigning role ${role} to user:`, error);
    throw error;
  }
};

/**
 * Removes a role from a user
 */
export const removeRoleFromUser = async (userId, role) => {
  try {
    const { error } = await supabase
      .from('user_roles_meditravel_x8f24k')
      .delete()
      .match({ user_id: userId, role });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error removing role ${role} from user:`, error);
    throw error;
  }
};

/**
 * Gets all roles for a user
 */
export const getUserRoles = async (userId) => {
  try {
    const { data, error } = await supabase.rpc(
      'get_user_roles',
      { lookup_user_id: userId }
    );
    
    if (error) throw error;
    return data.map(r => r.role);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
};

/**
 * Gets all permissions for a user
 */
export const getUserPermissions = async (userId) => {
  try {
    const { data, error } = await supabase.rpc(
      'get_user_permissions',
      { lookup_user_id: userId }
    );
    
    if (error) throw error;
    return data.map(p => p.permission);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    throw error;
  }
};

/**
 * Checks if a user has a specific permission
 */
export const checkUserPermission = async (userId, permissionName) => {
  try {
    const { data, error } = await supabase.rpc(
      'user_has_permission',
      { 
        user_id: userId,
        permission_name: permissionName
      }
    );
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error checking if user has permission ${permissionName}:`, error);
    throw error;
  }
};