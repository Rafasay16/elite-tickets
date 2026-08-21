import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import PerfilClient from './PerfilClient';

export default async function PerfilPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const cookieStore = cookies();
  const rawToken = cookieStore.get('token')?.value;

  let initialProfile = {};
  try {
    const res = await fetch(`http://127.0.0.1:3333/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${rawToken}`,
      },
      cache: 'no-store',
    });
    
    if (res.ok) {
      const data = await res.json();
      initialProfile = data.profile || {};
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  }

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto', marginTop: '80px' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Meu Perfil</h1>
      <PerfilClient initialProfile={initialProfile} sessionToken={rawToken || ''} />
    </div>
  );
}
