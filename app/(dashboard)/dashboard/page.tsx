import { Suspense } from 'react';
import { PageLoader } from '@/components/ui';
import { DashboardPageContent } from '@/components/dashboard/DashboardPageContent';

export const metadata = {
  title: 'Dashboard - PrestaMax',
  description: 'Estadísticas de préstamos y clientes',
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DashboardPageContent />
    </Suspense>
  );
}
