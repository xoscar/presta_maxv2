'use client';

import { useState } from 'react';
import { Sidebar, SidebarContent } from './Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/lib/hooks';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  username: string;
}

export function DashboardLayout({ children, username }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar username={username} onLogout={handleLogout} />

      {/* Mobile top bar */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <span className="text-xl font-bold text-primary">PrestaMax</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* Mobile nav drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex h-14 shrink-0 items-center justify-end border-b border-border px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <SidebarContent
              username={username}
              onLogout={handleLogout}
              onLinkClick={() => setMobileMenuOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <main className="p-4 pt-14 md:ml-64 md:pt-8 md:p-8">{children}</main>
    </div>
  );
}

export default DashboardLayout;
