import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../ui/LoadingScreen';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = user?.roles.some(role => allowedRoles.includes(role));
    
    // If user doesn't have required role, redirect based on their role
    if (!hasRequiredRole) {
      // If user is admin, redirect to admin dashboard
      if (user?.roles.includes('admin') || user?.roles.includes('reviewer')) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      
      // Otherwise redirect to regular dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Render the protected route
  return <Outlet />;
};

export default PrivateRoute;