import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarIcon, MapPinIcon, TicketIcon } from "@/components/Icons";
import styles from "./page.module.css";
import TicketCard from "@/components/TicketCard";

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
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        reservations = data.ingressos || [];
      }
    } catch (e) {
      console.error(e);
    }
  }

  const reservationsWithQr = reservations.map((res) => ({
    ...res,
    qrDataUrl: res.qrCodeUrl
  }));

  return (
    <main className="container" style={{ padding: '4rem 1.5rem' }}>
      
      {searchParams.sucesso && (
        <div className={styles.successBanner}>
          Reserva concluída com sucesso! Seu ingresso já está disponível.
        </div>
      )}

      <h1 className="neon-text" style={{ marginBottom: '2rem' }}>Meus Ingressos</h1>

      {reservationsWithQr.length === 0 ? (
        <p className="text-secondary">Você ainda não tem ingressos confirmados.</p>
      ) : (
        <div className={styles.grid}>
          {reservationsWithQr.map((res) => (
            <TicketCard key={res.id} res={res} />
          ))}
        </div>
      )}
    </main>
  );
}
