import { getSession } from '@/lib/auth';
import HeaderClient from './HeaderClient';
import { cookies } from 'next/headers';

export default async function Header() {
  const session = await getSession();
  const cookieStore = cookies();
  let currentCity = cookieStore.get('city')?.value || 'Todo o Brasil';
  if (session && session.city) {
    currentCity = session.city;
  }

  let photoUrl = '';
  const rawToken = cookieStore.get('token')?.value;
  if (session && rawToken) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
      const res = await fetch(`${apiUrl}/users/profile`, {
        headers: { Authorization: `Bearer ${rawToken}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        photoUrl = data.profile?.photoUrl || '';
      }
    } catch (e) {}
  }

  if (!photoUrl && session?.name) {
    photoUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(session.name)}`;
  }

  return (
    <HeaderClient
      session={session}
      photoUrl={photoUrl}
      currentCity={currentCity}
    />
  );
}
