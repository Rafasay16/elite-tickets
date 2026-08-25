'use client';

import { useState, useEffect, useCallback } from 'react';
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
  date: Date | string;
  location: string;
  type: string;
};

export default function Carousel({ events }: { events: Event[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (events.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % events.length);
  }, [events.length]);

  const prevSlide = useCallback(() => {
    if (events.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  }, [events.length]);

  useEffect(() => {
    if (events.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [events.length, isPaused, nextSlide]);

  if (events.length === 0) return null;

  return (
    <div 
      className={styles.carouselContainer}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
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
            <div className={styles.vignette} />
          </div>

          {/* Conteúdo Principal */}
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
              <span className={`${styles.badge} ${event.type === 'SHOW' ? styles.badgeShow : ''}`}>
                {event.type === 'SHOW' ? 'Show / Festival' : 'Estreia em Cartaz'}
              </span>
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

      {/* Botões de Navegação Anterior / Próximo */}
      {events.length > 1 && (
        <>
          <button 
            type="button"
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={prevSlide}
            aria-label="Slide anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button 
            type="button"
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={nextSlide}
            aria-label="Próximo slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

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
