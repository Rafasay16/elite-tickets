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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
    const res = await fetch(`${apiUrl}/users/profile`, {
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
    <main className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading-family)', fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>
          Meu <span className="text-gradient">Perfil</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
          Gerencie suas informações pessoais, credenciais de acesso e preferências da plataforma.
        </p>
      </div>
      <PerfilClient initialProfile={initialProfile} sessionToken={rawToken || ''} />
    </main>
  );
}
