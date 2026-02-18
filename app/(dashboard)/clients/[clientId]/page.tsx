import { Suspense } from 'react';
import { PageLoader } from '@/components/ui';
import { ClientProfileContent } from '@/components/clients/ClientProfileContent';

export const metadata = {
  title: 'Perfil de Cliente - PrestaMax',
};

interface Props {
  params: Promise<{ clientId: string }>;
}

export default async function ClientProfilePage({ params }: Props) {
  const { clientId } = await params;

  return (
    <Suspense fallback={<PageLoader />}>
      <ClientProfileContent clientId={clientId} />
    </Suspense>
  );
}
