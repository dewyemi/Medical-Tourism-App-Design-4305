import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

// Create context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Fetch user roles and permissions
          await fetchUserRolesAndPermissions(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          await fetchUserRolesAndPermissions(currentSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserRoles([]);
          setUserPermissions([]);
        }
        
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user roles and permissions
  const fetchUserRolesAndPermissions = async (userId) => {
    try {
      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase.rpc(
        'get_user_roles',
        { lookup_user_id: userId }
      );
      
      if (rolesError) throw rolesError;
      setUserRoles(rolesData.map(r => r.role));

      // Fetch user permissions
      const { data: permissionsData, error: permissionsError } = await supabase.rpc(
        'get_user_permissions',
        { lookup_user_id: userId }
      );
      
      if (permissionsError) throw permissionsError;
      setUserPermissions(permissionsData.map(p => p.permission));
    } catch (error) {
      console.error('Error fetching user roles and permissions:', error);
      // Set defaults if unable to fetch
      setUserRoles(['patient']);
      setUserPermissions(['bookings:create', 'bookings:read', 'bookings:update', 'users:read', 'users:update']);
    }
  };

  // Sign up function
  const signUp = async ({ email, password, firstName, lastName }) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    }
  };

  // Sign in function
  const signIn = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/update-password`,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: error.message };
    }
  };

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return userRoles.includes(role);
  };

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };

  // Check if user has admin role
  const isAdmin = useMemo(() => {
    return userRoles.includes('admin');
  }, [userRoles]);

  // Check if user is a healthcare provider
  const isHealthcareProvider = useMemo(() => {
    return userRoles.includes('healthcare_provider');
  }, [userRoles]);

  // Value to provide to consumers
  const value = {
    user,
    session,
    loading,
    userRoles,
    userPermissions,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    hasRole,
    hasPermission,
    isAdmin,
    isHealthcareProvider,
    refreshPermissions: () => fetchUserRolesAndPermissions(user?.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;