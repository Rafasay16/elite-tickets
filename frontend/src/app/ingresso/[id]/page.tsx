import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Image from "next/image";
import QRCode from "qrcode";
import { CalendarIcon, MapPinIcon } from "@/components/Icons";
import { getImageUrl } from "@/lib/tmdb";
import styles from "../../meus-ingressos/page.module.css";

export const dynamic = 'force-dynamic';

export default async function IngressoCompartilhadoPage({ params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    redirect(`/login?callbackUrl=/ingresso/${params.id}`);
  }

  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  let ticket: any = null;
  let errorMsg = null;

  if (token) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
    try {
      const res = await fetch(`${apiUrl}/checkout/shared/ticket/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      const data = await res.json();
      if (res.ok) {
        ticket = data.ticket;
      } else {
        errorMsg = data.error || 'Ingresso não encontrado.';
      }
    } catch (e) {
      errorMsg = 'Erro de conexão ao buscar o ingresso.';
    }
  }

  if (errorMsg || !ticket) {
    return (
      <main className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 className="neon-text" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Acesso Negado</h1>
        <p className="text-secondary">{errorMsg || 'Ingresso não encontrado.'}</p>
      </main>
    );
  }

  const qrDataUrl = await QRCode.toDataURL(ticket.id, {
    color: { dark: '#0f172a', light: '#ffffff' },
    margin: 2
  });

  const shortId = ticket.id.split('-')[0].toUpperCase();

  return (
    <main className="container" style={{ padding: '4rem 1.5rem', maxWidth: '500px' }}>
      <h1 className="neon-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>Seu Ingresso</h1>
      
      <div className={`glass-panel ${styles.ticket}`}>
        <div className={styles.eventInfo}>
          <Image
            src={getImageUrl(ticket.event.posterUrl)}
            alt="Poster"
            width={80}
            height={120}
            className={styles.ticketPoster}
          />
          <div>
            <h3>{ticket.event.title}</h3>
            <p className="text-secondary" style={{ display: 'flex', alignItems: 'center' }}><MapPinIcon /> {ticket.event.location}</p>
            <p className="text-secondary" style={{ display: 'flex', alignItems: 'center' }}><CalendarIcon /> {new Date(ticket.event.date).toLocaleString('pt-BR')}</p>
            <div className={styles.seatBadge}>
              Fila {ticket.seat.row} - Assento {ticket.seat.number}
            </div>
          </div>
        </div>

        <div className={styles.qrSection}>
          <div className={styles.cutout}></div>
          <div style={{ background: '#fff', padding: '8px', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             <Image src={qrDataUrl} alt="QR Code do Ingresso" width={140} height={140} />
          </div>
          <p className="text-secondary" style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
            #{shortId}
          </p>
        </div>
      </div>
    </main>
  );
}
