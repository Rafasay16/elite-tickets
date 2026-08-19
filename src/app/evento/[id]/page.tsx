import Image from "next/image";
import Header from "@/components/Header";
import { PrismaClient } from "@prisma/client";
import { getImageUrl } from "@/lib/tmdb";
import SeatMap from "@/components/SeatMap";
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

  // Organizar assentos por fileira para o mapa
  const seatsByRow = event.seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, typeof event.seats>);

  return (
    <main>
      <Header />
      
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
            <h1 className="neon-text">{event.title}</h1>
            <div className={styles.meta}>
              <span><CalendarIcon /> {new Date(event.date).toLocaleString('pt-BR')}</span>
              <span><MapPinIcon /> {event.location}</span>
              <span className={styles.price}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(event.price)}
              </span>
            </div>
            <p className={styles.description}>
               Viva esta experiência de cinema premium. Selecione seu assento abaixo e prepare a pipoca.
            </p>
          </div>
        </div>

        <section className={styles.bookingSection}>
          <h2>Selecione seu Assento</h2>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <SeatMap seatsByRow={seatsByRow} eventId={event.id} price={event.price} />
          </div>
        </section>
      </div>
    </main>
  );
}
