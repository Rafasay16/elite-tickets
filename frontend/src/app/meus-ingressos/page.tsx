import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { getSession } from '@/lib/auth';
import MeusIngressosClient from './MeusIngressosClient';

export const dynamic = 'force-dynamic';

export default async function MeusIngressos({ searchParams }: { searchParams: { sucesso?: string } }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  let reservations: any[] = [];
  if (token) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';

    try {
      const res = await fetch(`${apiUrl}/users/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        reservations = data.ingressos || [];
      }
    } catch (e) {
      console.error('Erro ao buscar ingressos', e);
    }
  }

  const reservationsWithQr = await Promise.all(
    reservations.map(async (res) => {
      let qrDataUrl = res.qrCodeUrl;
      if (!qrDataUrl) {
        try {
          qrDataUrl = await QRCode.toDataURL(res.id, {
            color: { dark: '#0f172a', light: '#ffffff' },
            margin: 2,
          });
        } catch (e) {}
      }
      return {
        ...res,
        qrDataUrl: qrDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${res.id}`,
      };
    })
  );

  return (
    <MeusIngressosClient
      initialReservations={reservationsWithQr}
      sucesso={searchParams.sucesso}
    />
  );
}
