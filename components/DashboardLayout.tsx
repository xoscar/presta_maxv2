'use client';

import { Sidebar } from './Sidebar';
import { useLogout } from '@/lib/hooks';

interface DashboardLayoutProps {
  children: React.ReactNode;
  username: string;
}

export function DashboardLayout({ children, username }: DashboardLayoutProps) {
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar username={username} onLogout={handleLogout} />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}

export default DashboardLayout;
