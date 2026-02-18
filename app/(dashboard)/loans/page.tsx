import { Suspense } from 'react';
import { PageLoader } from '@/components/ui';
import { LoansPageContent } from '@/components/loans/LoansPageContent';

export const metadata = {
  title: 'Préstamos - PrestaMax',
};

export default function LoansPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LoansPageContent />
    </Suspense>
  );
}
