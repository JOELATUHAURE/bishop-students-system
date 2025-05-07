// client/src/layouts/AuthLayout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
