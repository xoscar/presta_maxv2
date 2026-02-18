import { Suspense } from 'react';
import { PageLoader } from '@/components/ui';
import { LoanProfileContent } from '@/components/loans/LoanProfileContent';

export const metadata = {
  title: 'Detalle de Préstamo - PrestaMax',
};

interface Props {
  params: Promise<{ loanId: string }>;
}

export default async function LoanProfilePage({ params }: Props) {
  const { loanId } = await params;

  return (
    <Suspense fallback={<PageLoader />}>
      <LoanProfileContent loanId={loanId} />
    </Suspense>
  );
}
