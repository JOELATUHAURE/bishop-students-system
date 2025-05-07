// client/src/layouts/DashboardLayout.tsx

import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
