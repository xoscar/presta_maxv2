'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Users, DollarSign, ChevronUp, LogOut } from 'lucide-react';

const navItems = [
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/loans', label: 'Préstamos', icon: DollarSign },
];

interface SidebarContentProps {
  username: string;
  onLogout: () => void;
  onLinkClick?: () => void;
}

export function SidebarContent({ username, onLogout, onLinkClick }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <div className="text-2xl font-bold text-primary">PrestaMax</div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Button
                  asChild
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start gap-3 h-12 ${
                    isActive ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''
                  }`}
                >
                  <Link href={item.href} onClick={onLinkClick}>
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      {/* User section */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              data-testid="user-menu"
              variant="ghost"
              className="w-full justify-start gap-3 h-14 px-3"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{username}</div>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem
              data-testid="logout-button"
              onClick={onLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface SidebarProps {
  username: string;
  onLogout: () => void;
}

export function Sidebar({ username, onLogout }: SidebarProps) {
  return (
    <aside
      data-testid="sidebar"
      className="fixed left-0 top-0 h-full w-64 bg-card shadow-lg z-50 border-r border-border hidden md:block"
    >
      <SidebarContent username={username} onLogout={onLogout} />
    </aside>
  );
}

export default Sidebar;
