import Image from "next/image";
import { PrismaClient } from "@prisma/client";
import { getImageUrl } from "@/lib/tmdb";
import SeatMap from "@/components/SeatMap";
import SectorSelection from "@/components/SectorSelection";
import { notFound } from "next/navigation";
import { CalendarIcon, MapPinIcon } from "@/components/Icons";
import styles from "./page.module.css";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function EventoPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      seats: {
        orderBy: [
          { row: 'asc' },
          { number: 'asc' }
        ]
      }
    }
  });

  if (!event) return notFound();

  // Organizar assentos por fileira para o mapa (somente usado se for filme)
  const seatsByRow = event.seats.reduce((acc, seat) => {
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
            <span className="btn" style={{ background: 'var(--accent-neon)', color: '#fff', padding: '0.2rem 1rem', borderRadius: '999px', display: 'inline-block', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 'bold'}}>
              {isShow ? 'Show / Festival' : 'Cinema Premium'}
            </span>
            <h1 className="neon-text">{event.title}</h1>
            <div className={styles.meta}>
              <span><CalendarIcon /> {new Date(event.date).toLocaleString('pt-BR')}</span>
              <span><MapPinIcon /> {event.location}</span>
              <span className={styles.price}>
                {isShow ? 'A partir de ' : ''}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(event.price)}
              </span>
            </div>
            <p className={styles.description}>
               {isShow ? 'Garanta seu lote antes que esgote. Escolha o setor abaixo.' : 'Viva esta experiência de cinema premium. Selecione seu assento abaixo e prepare a pipoca.'}
            </p>
          </div>
        </div>

        <section className={styles.bookingSection}>
          <h2>{isShow ? 'Selecione seu Setor' : 'Selecione seu Assento'}</h2>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            {isShow ? (
              <SectorSelection seats={event.seats} eventId={event.id} basePrice={event.price} />
            ) : (
              <SeatMap seatsByRow={seatsByRow} eventId={event.id} price={event.price} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
