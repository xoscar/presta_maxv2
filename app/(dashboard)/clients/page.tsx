import { Suspense } from 'react';
import { PageLoader } from '@/components/ui';
import { ClientsPageContent } from '@/components/clients/ClientsPageContent';

export const metadata = {
  title: 'Clientes - PrestaMax',
};

export default function ClientsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ClientsPageContent />
    </Suspense>
  );
}
