import { redirect } from 'next/navigation';
import { getUserFromCookies } from '@/lib/auth';

export default async function HomePage() {
  const user = await getUserFromCookies();

  if (user) {
    redirect('/clients');
  } else {
    redirect('/login');
  }
}
