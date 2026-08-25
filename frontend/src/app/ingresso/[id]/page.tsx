import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import QRCode from 'qrcode';
import { getSession } from '@/lib/auth';
import { CalendarIcon, MapPinIcon } from '@/components/Icons';
import { getImageUrl } from '@/lib/tmdb';
import styles from '../../meus-ingressos/page.module.css';

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
        cache: 'no-store',
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
    margin: 2,
  });

  const shortId = ticket.id.split('-')[0].toUpperCase();

  return (
    <main className="container" style={{ padding: '4rem 1.5rem 6rem 1.5rem', maxWidth: '640px' }}>
      <h1 className={styles.title} style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Seu <span className="text-gradient">Ingresso</span>
      </h1>

      <div className={styles.ticketCard}>
        <div className={styles.ticketMain}>
          <div className={styles.eventRow}>
            <div className={styles.posterWrapper}>
              <Image
                src={getImageUrl(ticket.event.posterUrl || null)}
                alt={`Pôster de ${ticket.event.title}`}
                fill
                className={styles.poster}
                sizes="72px"
              />
            </div>

            <div className={styles.eventDetails}>
              <h3 className={styles.eventTitle}>{ticket.event.title}</h3>

              <div className={styles.metaItem}>
                <CalendarIcon />
                <span>
                  {new Date(ticket.event.date).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              <div className={styles.metaItem} title={ticket.event.location}>
                <MapPinIcon />
                <span>{ticket.event.location}</span>
              </div>
            </div>
          </div>

          <div className={styles.seatRow}>
            <div className={styles.seatBadge}>
              Fila {ticket.seat.row} &bull; Assento {ticket.seat.number}
            </div>
          </div>
        </div>

        <div className={styles.ticketStub}>
          <div className={styles.cutoutTop}></div>
          <div className={styles.cutoutBottom}></div>

          <div className={styles.qrContainer}>
            <Image
              src={qrDataUrl}
              alt="QR Code do Ingresso"
              width={100}
              height={100}
              className={styles.qrCodeImg}
              unoptimized
            />
          </div>

          <span className={styles.shortCode}>#{shortId}</span>
        </div>
      </div>
    </main>
  );
}
