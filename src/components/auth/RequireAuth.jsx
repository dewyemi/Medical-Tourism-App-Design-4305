import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

const RequireAuth = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [] 
}) => {
  const { user, loading, userRoles, userPermissions } = useAuth();
  const location = useLocation();

  // Show loading screen while auth state is being determined
  if (loading) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to landing page
  if (!user) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  // Check required roles if specified
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check required permissions if specified
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
    if (!hasRequiredPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required roles/permissions
  return children;
};

export default RequireAuth;