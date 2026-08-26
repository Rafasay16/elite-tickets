import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/tmdb";
import SeatMap from "@/components/SeatMap";
import SectorSelection from "@/components/SectorSelection";
import { notFound } from "next/navigation";
import { CalendarIcon, MapPinIcon } from "@/components/Icons";
import SessionPicker from "@/components/SessionPicker";
import RatingBadge from "@/components/RatingBadge";
import styles from "./page.module.css";

export const dynamic = 'force-dynamic';

export default async function EventoPage({ params }: { params: { id: string } }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
  const res = await fetch(`${apiUrl}/events/${params.id}`, { cache: 'no-store' });

  if (!res.ok) {
    return (
      <main className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Evento não encontrado.</h2>
        <Link href="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Voltar para o Início</Link>
      </main>
    );
  }

  const event = await res.json();
  if (!event) return notFound();

  // Buscar todas as sessões deste filme na mesma cidade
  let sessions = [];
  try {
    const sessionsRes = await fetch(`${apiUrl}/events?city=${encodeURIComponent(event.city)}`, { cache: 'no-store' });
    if (sessionsRes.ok) {
      const allEvents = await sessionsRes.json();
      sessions = allEvents.filter((e: any) => (event.externalId ? e.externalId === event.externalId : e.title === event.title));
    }
  } catch (e) {
    console.error('Erro ao buscar sessões', e);
  }

  // Organizar assentos por fileira para o mapa (somente usado se for filme)
  const seatsByRow = event.seats.reduce((acc: any, seat: any) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, typeof event.seats>);

  const isShow = (event as any).type === 'SHOW';

  return (
    <main>
      
      <div className={styles.backdropContainer}>
        <div className={styles.backdropOverlay}></div>
        <Image
          src={getImageUrl(event.backdropUrl, "original")}
          alt={`Cenário de ${event.title}`}
          fill
          className={styles.backdrop}
          priority
        />
      </div>

      <div className={`container ${styles.contentContainer}`}>
        
        {/* Botão de Voltar */}
        <Link href="/" className={styles.backLink}>
          <span>←</span>
          <span>Voltar para Todos os Eventos</span>
        </Link>

        <div className={styles.header}>
          <div className={styles.posterWrapper}>
            <Image
              src={getImageUrl(event.posterUrl)}
              alt={`Pôster de ${event.title}`}
              fill
              className={styles.poster}
            />
          </div>
          
          <div className={styles.info}>
            <span className={styles.typeBadge}>
              {isShow ? 'Show / Festival' : 'Cinema Premium'}
            </span>
            
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{event.title}</h1>
              <RatingBadge rating={event.rating} />
            </div>

            <div className={styles.meta}>
              <span className={styles.metaItem}>
                <CalendarIcon />
                <span>{new Date(event.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </span>
              <span className={styles.metaItem}>
                <MapPinIcon />
                <span>{event.location}</span>
              </span>
              <span className={styles.price}>
                {isShow ? 'A partir de ' : ''}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(event.price)}
              </span>
            </div>

            <p className={styles.description}>
              {event.description || (isShow ? 'Garanta seu lote oficial antes que esgote. Escolha o setor e área desejada abaixo.' : 'Viva esta experiência de cinema premium com som imersivo e imagem de alta fidelidade. Selecione sua poltrona abaixo.')}
            </p>

            {/* Perks / Amenities Chips */}
            <div className={styles.perksList}>
              <span className={styles.perkChip}>🔊 Som Espacial Dolby Atmos</span>
              <span className={styles.perkChip}>💺 Poltronas Reclináveis</span>
              <span className={styles.perkChip}>❄️ Ambiente Climatizado</span>
              <span className={styles.perkChip}>♿ Acessibilidade PCD</span>
            </div>
          </div>
        </div>

        <section className={styles.bookingSection}>
          
          {sessions.length > 1 && (
            <SessionPicker sessions={sessions} currentSessionId={event.id} />
          )}

          <h2 className={styles.bookingTitle}>{isShow ? 'Selecione seu Setor / Lote' : 'Selecione sua Poltrona'}</h2>
          <div className="glass-panel" style={{ padding: '2.5rem 2rem', background: 'var(--background-card)' }}>
            {isShow ? (
              <SectorSelection seats={event.seats} eventId={event.id} basePrice={event.price} maxTickets={event.maxTicketsPerUser} feeRate={event.organizer.feeRate} />
            ) : (
              <SeatMap seatsByRow={seatsByRow} eventId={event.id} price={event.price} feeRate={event.organizer.feeRate} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
