import Image from "next/image";
import Link from "next/link";
import Carousel from "@/components/Carousel";
import { PrismaClient } from "@prisma/client";
import { getImageUrl } from "@/lib/tmdb";
import { CalendarIcon, MapPinIcon } from "@/components/Icons";
import styles from "./page.module.css";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function Home() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { date: "asc" },
  });

  const featuredEvents = events.slice(0, 4); // Top 4 para o carrossel
  const movies = events.filter(e => e.type === 'MOVIE');
  const shows = events.filter(e => e.type === 'SHOW');

  const renderEventCard = (event: any) => (
    <Link href={`/evento/${event.id}`} key={event.id} className={styles.card}>
      <div className={styles.posterWrapper}>
        <Image
          src={getImageUrl(event.posterUrl)}
          alt={`Pôster de ${event.title}`}
          fill
          className={styles.poster}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className={styles.overlay}>
          <span className="btn btn-primary">Reservar</span>
        </div>
      </div>
      <div className={styles.cardInfo}>
        <h3>{event.title}</h3>
        <div className={styles.meta}>
          <span><CalendarIcon /> {new Date(event.date).toLocaleDateString('pt-BR')}</span>
          <span><MapPinIcon /> {event.location}</span>
        </div>
        <div className={styles.price}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(event.price)}
        </div>
      </div>
    </Link>
  );

  return (
    <main>
      
      <Carousel events={featuredEvents} />

      <section className="container">
        {movies.length > 0 && (
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Filmes em Cartaz</h2>
            <div className={styles.grid}>
              {movies.map(renderEventCard)}
            </div>
          </div>
        )}

        {shows.length > 0 && (
          <div className={styles.sectionBlock} style={{ marginTop: '4rem' }}>
            <h2 className={styles.sectionTitle}>Shows e Festivais</h2>
            <div className={styles.grid}>
              {shows.map(renderEventCard)}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
