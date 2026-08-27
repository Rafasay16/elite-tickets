'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/tmdb';
import { CalendarIcon, MapPinIcon } from './Icons';
import RatingBadge from './RatingBadge';
import styles from './EventCatalog.module.css';

interface EventItem {
  id: string;
  title: string;
  posterUrl: string | null;
  backdropUrl?: string | null;
  date: string | Date;
  location: string;
  price: number;
  type: string;
  rating?: string | number | null;
  externalId?: string;
}

interface EventCatalogProps {
  initialEvents: EventItem[];
  currentCity: string;
}

export default function EventCatalog({ initialEvents, currentCity }: EventCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Category Counts
  const counts = useMemo(() => {
    return {
      ALL: initialEvents.length,
      MOVIE: initialEvents.filter(e => e.type === 'MOVIE').length,
      SHOW: initialEvents.filter(e => e.type === 'SHOW').length,
      THEATER: initialEvents.filter(e => e.type === 'THEATER' || e.type === 'STANDUP' || e.type === 'OUTRO').length,
    };
  }, [initialEvents]);

  // Filter logic
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      // Category Filter
      if (selectedCategory === 'MOVIE' && event.type !== 'MOVIE') return false;
      if (selectedCategory === 'SHOW' && event.type !== 'SHOW') return false;
      if (selectedCategory === 'THEATER' && (event.type === 'MOVIE' || event.type === 'SHOW')) return false;

      // Text Query Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = event.title.toLowerCase().includes(query);
        const matchLocation = event.location.toLowerCase().includes(query);
        if (!matchTitle && !matchLocation) return false;
      }

      // Date Filters
      if (selectedDateFilter !== 'ALL') {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDateFilter === 'TODAY') {
          const isToday = eventDate.toDateString() === today.toDateString();
          if (!isToday) return false;
        } else if (selectedDateFilter === 'WEEKEND') {
          const dayOfWeek = eventDate.getDay(); // 0 is Sunday, 6 is Saturday, 5 is Friday
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
          if (!isWeekend) return false;
        } else if (selectedDateFilter === 'MONTH') {
          const isThisMonth = eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
          if (!isThisMonth) return false;
        }
      }

      return true;
    });
  }, [initialEvents, selectedCategory, selectedDateFilter, searchQuery]);

  const clearAllFilters = () => {
    setSelectedCategory('ALL');
    setSelectedDateFilter('ALL');
    setSearchQuery('');
  };

  return (
    <section>
      {/* BARRA DE FILTROS FACETADOS */}
      <div className={styles.filterBar}>
        {/* Linha Superior: Pílulas de Categorias + Campo de Busca Rápida */}
        <div className={styles.topRow}>
          <div className={styles.categoryGroup}>
            <button
              type="button"
              className={`${styles.categoryPill} ${selectedCategory === 'ALL' ? styles.categoryPillActive : ''}`}
              onClick={() => setSelectedCategory('ALL')}
            >
              <span>Todos</span>
              <span className={styles.countBadge}>{counts.ALL}</span>
            </button>

            <button
              type="button"
              className={`${styles.categoryPill} ${selectedCategory === 'MOVIE' ? styles.categoryPillActive : ''}`}
              onClick={() => setSelectedCategory('MOVIE')}
            >
              <span>Cinema</span>
              <span className={styles.countBadge}>{counts.MOVIE}</span>
            </button>

            <button
              type="button"
              className={`${styles.categoryPill} ${selectedCategory === 'SHOW' ? styles.categoryPillActive : ''}`}
              onClick={() => setSelectedCategory('SHOW')}
            >
              <span>Shows & Festivais</span>
              <span className={styles.countBadge}>{counts.SHOW}</span>
            </button>

            {counts.THEATER > 0 && (
              <button
                type="button"
                className={`${styles.categoryPill} ${selectedCategory === 'THEATER' ? styles.categoryPillActive : ''}`}
                onClick={() => setSelectedCategory('THEATER')}
              >
                <span>Teatro & Stand-up</span>
                <span className={styles.countBadge}>{counts.THEATER}</span>
              </button>
            )}
          </div>

          <div className={styles.searchInputWrapper}>
            <svg
              className={styles.searchIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar no catálogo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Linha Inferior: Chips de Data + Resumo de Resultados */}
        <div className={styles.dateRow}>
          <div className={styles.dateGroup}>
            <span className={styles.dateLabel}>Data:</span>
            <button
              type="button"
              className={`${styles.dateChip} ${selectedDateFilter === 'ALL' ? styles.dateChipActive : ''}`}
              onClick={() => setSelectedDateFilter('ALL')}
            >
              Todas as Datas
            </button>
            <button
              type="button"
              className={`${styles.dateChip} ${selectedDateFilter === 'TODAY' ? styles.dateChipActive : ''}`}
              onClick={() => setSelectedDateFilter('TODAY')}
            >
              Hoje
            </button>
            <button
              type="button"
              className={`${styles.dateChip} ${selectedDateFilter === 'WEEKEND' ? styles.dateChipActive : ''}`}
              onClick={() => setSelectedDateFilter('WEEKEND')}
            >
              Fim de Semana
            </button>
            <button
              type="button"
              className={`${styles.dateChip} ${selectedDateFilter === 'MONTH' ? styles.dateChipActive : ''}`}
              onClick={() => setSelectedDateFilter('MONTH')}
            >
              Este Mês
            </button>
          </div>

          <div className={styles.resultsCount}>
            Exibindo <span className={styles.resultsNumber}>{filteredEvents.length}</span> {filteredEvents.length === 1 ? 'evento' : 'eventos'} em <span className={styles.resultsNumber}>{currentCity}</span>
          </div>
        </div>
      </div>

      {/* GRADE DE EVENTOS */}
      {filteredEvents.length === 0 ? (
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>Nenhum evento encontrado</h3>
          <p className={styles.emptyText}>
            Não encontramos eventos correspondentes aos filtros selecionados para {currentCity}. Tente redefinir a busca ou mudar a localização.
          </p>
          <button type="button" onClick={clearAllFilters} className={styles.clearFiltersBtn}>
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredEvents.map((event) => (
            <Link href={`/evento/${event.id}`} key={event.id} className={styles.card}>
              <div className={styles.posterWrapper}>
                <Image
                  src={getImageUrl(event.posterUrl)}
                  alt={`Pôster de ${event.title}`}
                  fill
                  className={styles.poster}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Badge de Categoria */}
                <div className={`${styles.cardBadge} ${event.type === 'SHOW' ? styles.cardBadgeShow : ''}`}>
                  {event.type === 'SHOW' ? 'Show / Festival' : 'Cinema'}
                </div>

                {/* Overlay de Hover com Ação Rápida */}
                <div className={styles.overlay}>
                  <span className={styles.reserveBtn}>Garantir Ingresso</span>
                </div>
              </div>

              <div className={styles.cardInfo}>
                <div>
                  <div className={styles.titleRow}>
                    <h3 className={styles.cardTitle}>{event.title}</h3>
                    {event.rating ? <RatingBadge rating={String(event.rating)} /> : null}
                  </div>

                  <div className={styles.meta}>
                    <span className={styles.metaItem}>
                      <CalendarIcon /> {new Date(event.date).toLocaleDateString('pt-BR')}
                    </span>
                    <span className={styles.metaItem}>
                      <MapPinIcon /> {event.location}
                    </span>
                  </div>
                </div>

                <div className={styles.footerRow}>
                  <div>
                    <div className={styles.priceLabel}>A partir de</div>
                    <div className={styles.priceValue}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(event.price ?? ((event.priceInCents ?? 0) / 100))}
                    </div>
                  </div>
                  <span className={styles.sessionsHint}>Sessões disponíveis</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
