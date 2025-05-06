import { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';  // Correct import for ErrorBoundary

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/applicant/Dashboard';
import NewApplication from './pages/applicant/NewApplication';
import ApplicationForm from './pages/applicant/ApplicationForm';
import ApplicationDetails from './pages/applicant/ApplicationDetails';
import Profile from './pages/applicant/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import ApplicationsList from './pages/admin/ApplicationsList';
import AdminApplicationDetails from './pages/admin/ApplicationDetails';
import AuditLogs from './pages/admin/AuditLogs';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

// Components
import LoadingScreen from './components/ui/LoadingScreen';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import { Toaster } from './components/ui/Toaster';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const { i18n } = useTranslation();

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <ErrorBoundary FallbackComponent={LoadingScreen}> {/* ErrorBoundary Wrapper */}
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Applicant Routes */}
                <Route element={<PrivateRoute allowedRoles={['applicant']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/applications/new" element={<NewApplication />} />
                    <Route path="/applications/:id" element={<ApplicationDetails />} />
                    <Route path="/applications/:id/form" element={<ApplicationForm />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={<AdminRoute allowedRoles={['admin', 'reviewer']} />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/applications" element={<ApplicationsList />} />
                    <Route path="/admin/applications/:id" element={<AdminApplicationDetails />} />
                    <Route path="/admin/audit-logs" element={<AuditLogs />} />
                    <Route path="/admin/reports" element={<Reports />} />
                    <Route path="/admin/settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Redirect root to dashboard or login */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
