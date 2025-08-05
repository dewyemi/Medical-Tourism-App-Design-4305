import { useAuth } from '../../contexts/AuthContext';

// Component that conditionally renders content based on user roles or permissions
const RoleBasedContent = ({ 
  requiredRoles = [], 
  requiredPermissions = [], 
  children,
  fallback = null
}) => {
  const { hasRole, hasPermission, loading } = useAuth();
  
  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.length === 0 || 
    requiredRoles.some(role => hasRole(role));
  
  // Check if user has any of the required permissions
  const hasRequiredPermission = requiredPermissions.length === 0 || 
    requiredPermissions.some(permission => hasPermission(permission));
  
  // Render content if user has required role and permission
  if (hasRequiredRole && hasRequiredPermission) {
    return children;
  }
  
  // Otherwise render fallback content
  return fallback;
};

export default RoleBasedContent;