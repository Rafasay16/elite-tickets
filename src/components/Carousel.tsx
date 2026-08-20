'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/tmdb';
import { CalendarIcon, MapPinIcon } from './Icons';
import styles from './Carousel.module.css';

type Event = {
  id: string;
  title: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  date: Date;
  location: string;
  type: string;
};

export default function Carousel({ events }: { events: Event[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 5000); // Rotação a cada 5 segundos
    return () => clearInterval(timer);
  }, [events.length]);

  if (events.length === 0) return null;

  return (
    <div className={styles.carouselContainer}>
      {events.map((event, index) => (
        <div
          key={event.id}
          className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
        >
          {/* Fundo Desfocado (Backdrop) */}
          <div className={styles.backdropWrapper}>
            <Image
              src={getImageUrl(event.backdropUrl || event.posterUrl, 'original')}
              alt={`Fundo de ${event.title}`}
              fill
              className={styles.backdropImage}
              priority={index === 0}
            />
            <div className={styles.vignette}></div>
          </div>

          {/* Conteudo Principal */}
          <div className={styles.content}>
            <div className={styles.posterWrapper}>
              <Image
                src={getImageUrl(event.posterUrl)}
                alt={`Pôster de ${event.title}`}
                fill
                className={styles.posterImage}
                priority={index === 0}
              />
            </div>
            
            <div className={styles.info}>
              <span className={styles.badge}>{event.type === 'SHOW' ? 'Show / Festival' : 'Estreia'}</span>
              <h1 className={styles.title}>{event.title}</h1>
              <div className={styles.meta}>
                <span><CalendarIcon /> {new Date(event.date).toLocaleDateString('pt-BR')}</span>
                <span><MapPinIcon /> {event.location}</span>
              </div>
              <Link href={`/evento/${event.id}`} className="btn btn-primary" style={{ marginTop: '2rem' }}>
                Garantir Ingresso
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Indicadores */}
      <div className={styles.indicators}>
        {events.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === currentIndex ? styles.indicatorActive : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir para o slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
