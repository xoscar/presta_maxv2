import { redirect } from 'next/navigation';
import { getUserFromCookies } from '@/lib/auth';
import { DashboardLayout } from '@/components/DashboardLayout';

export default async function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const user = await getUserFromCookies();

  if (!user) {
    redirect('/login');
  }

  return <DashboardLayout username={user.username}>{children}</DashboardLayout>;
}
