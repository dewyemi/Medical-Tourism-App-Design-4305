import supabase from '../lib/supabase';

// User Management
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles_meditravel')
      .select(`
        *,
        user:id(id, email, created_at),
        roles:user_roles_meditravel_x8f24k(role)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to include user email and roles
    return data.map(profile => ({
      id: profile.id,
      email: profile.user?.email || '',
      created_at: profile.created_at,
      profile,
      roles: profile.roles?.map(r => r.role) || ['patient']
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, newRole) => {
  try {
    // First, remove existing roles for this user
    const { error: deleteError } = await supabase
      .from('user_roles_meditravel_x8f24k')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Then add the new role
    const { data, error } = await supabase
      .from('user_roles_meditravel_x8f24k')
      .insert({ user_id: userId, role: newRole })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    // Delete user roles first
    await supabase
      .from('user_roles_meditravel_x8f24k')
      .delete()
      .eq('user_id', userId);

    // Delete user profile
    const { error } = await supabase
      .from('user_profiles_meditravel')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Permissions Management
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
    return data.map(item => item.permission);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    throw error;
  }
};

export const updateRolePermissions = async (role, permissionName, hasPermission) => {
  try {
    // Get permission ID
    const { data: permission, error: permError } = await supabase
      .from('permissions_meditravel_x8f24k')
      .select('id')
      .eq('name', permissionName)
      .single();

    if (permError) throw permError;

    if (hasPermission) {
      // Add permission
      const { error } = await supabase
        .from('role_permissions_meditravel_x8f24k')
        .insert({ role, permission_id: permission.id });

      if (error) throw error;
    } else {
      // Remove permission
      const { error } = await supabase
        .from('role_permissions_meditravel_x8f24k')
        .delete()
        .match({ role, permission_id: permission.id });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating role permissions:', error);
    throw error;
  }
};

// Healthcare Provider Applications
export const getProviderApplications = async () => {
  try {
    const { data, error } = await supabase
      .from('provider_applications_meditravel')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching provider applications:', error);
    // Return empty array if table doesn't exist yet
    return [];
  }
};

export const approveProviderApplication = async (applicationId) => {
  try {
    // Update application status
    const { data: application, error: updateError } = await supabase
      .from('provider_applications_meditravel')
      .update({ status: 'approved' })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Assign healthcare_provider role to user
    const { error: roleError } = await supabase
      .from('user_roles_meditravel_x8f24k')
      .insert({ user_id: application.user_id, role: 'healthcare_provider' });

    if (roleError) throw roleError;

    return application;
  } catch (error) {
    console.error('Error approving provider application:', error);
    throw error;
  }
};

export const rejectProviderApplication = async (applicationId, reason) => {
  try {
    const { data, error } = await supabase
      .from('provider_applications_meditravel')
      .update({ 
        status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error rejecting provider application:', error);
    throw error;
  }
};

// System Analytics
export const getSystemAnalytics = async (timeRange = '30d') => {
  try {
    // Get basic counts
    const { count: totalUsers } = await supabase
      .from('user_profiles_meditravel')
      .select('id', { count: 'exact', head: true });

    const { count: totalBookings } = await supabase
      .from('bookings_meditravel')
      .select('id', { count: 'exact', head: true });

    const { count: activeProviders } = await supabase
      .from('user_roles_meditravel_x8f24k')
      .select('user_id', { count: 'exact', head: true })
      .eq('role', 'healthcare_provider');

    // Get booking status distribution
    const { data: bookingData } = await supabase
      .from('bookings_meditravel')
      .select('status');

    const bookingStatus = bookingData?.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    const bookingStatusChart = Object.entries(bookingStatus || {}).map(([status, count]) => ({
      name: status,
      value: count
    }));

    // Mock user growth data (you can implement actual logic)
    const userGrowth = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 10) + 1
    }));

    // Mock recent activity
    const recentActivity = [
      { description: 'New user registered', type: 'user', timestamp: '2 hours ago' },
      { description: 'Booking completed', type: 'booking', timestamp: '4 hours ago' },
      { description: 'Provider application submitted', type: 'provider', timestamp: '6 hours ago' },
      { description: 'New treatment added', type: 'system', timestamp: '8 hours ago' },
      { description: 'User profile updated', type: 'user', timestamp: '10 hours ago' }
    ];

    return {
      totalUsers: totalUsers || 0,
      totalBookings: totalBookings || 0,
      activeProviders: activeProviders || 0,
      revenue: '12,500', // Mock data
      userGrowth,
      bookingStatus: bookingStatusChart,
      recentActivity
    };
  } catch (error) {
    console.error('Error fetching system analytics:', error);
    throw error;
  }
};