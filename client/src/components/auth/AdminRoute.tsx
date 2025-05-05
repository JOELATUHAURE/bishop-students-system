import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../ui/LoadingScreen';

interface AdminRouteProps {
  allowedRoles: string[];
}

const AdminRoute: React.FC<AdminRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  const hasRequiredRole = user?.roles.some(role => allowedRoles.includes(role));
  
  // If user doesn't have required role, redirect to dashboard
  if (!hasRequiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected admin route
  return <Outlet />;
};

export default AdminRoute;