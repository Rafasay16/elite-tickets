import Image from "next/image";
import Link from "next/link";
import Carousel from "@/components/Carousel";
import { fetchPopularMovies, getImageUrl } from "@/lib/tmdb";
import { CalendarIcon, MapPinIcon } from "@/components/Icons";
import RatingBadge from "@/components/RatingBadge";
import styles from "./page.module.css";
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';

export default async function Home() {
  const session = await getSession();
  const cookieStore = cookies();
  let currentCity = cookieStore.get('city')?.value || 'Todo o Brasil';
  if (session && session.city) {
    currentCity = session.city;
  }

  const popularMovies = await fetchPopularMovies();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';

  let events = [];
  try {
    const res = await fetch(`${apiUrl}/events?city=${encodeURIComponent(currentCity)}`, { cache: 'no-store' });
    if (res.ok) {
      events = await res.json();
    }
  } catch (e) {
    console.error("Erro ao buscar eventos do Express");
  }

  // Agrupar eventos para exibir apenas um card por filme/show
  const groupedEvents = Object.values(events.reduce((acc: any, event: any) => {
    const key = event.externalId || event.title;
    if (!acc[key]) {
      acc[key] = event; // Guarda apenas a primeira ocorrência
    }
    return acc;
  }, {}));

  const featuredEvents = groupedEvents.slice(0, 4); // Top 4 para o carrossel
  const movies = groupedEvents.filter((e: any) => e.type === 'MOVIE');
  const shows = groupedEvents.filter((e: any) => e.type === 'SHOW');

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>{event.title}</h3>
          <RatingBadge rating={event.rating} />
        </div>
        <div className={styles.meta} style={{ marginTop: '0.5rem' }}>
          <span><CalendarIcon /> Várias Sessões</span>
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
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <h2 style={{ color: 'var(--text-secondary)' }}>Nenhum evento encontrado em {currentCity}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Tente mudar a localização no topo da página ou volte mais tarde.</p>
          </div>
        ) : (
          <>
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
            
            {movies.length === 0 && shows.length === 0 && (
              <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                <h2 style={{ color: 'var(--text-secondary)' }}>Nenhum evento disponível no momento</h2>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
