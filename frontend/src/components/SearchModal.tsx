'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon, FilmIcon, MusicIcon } from './Icons';
import { getImageUrl } from '@/lib/tmdb';
import RatingBadge from './RatingBadge';

function normalizeText(text: string = ''): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ') // treat punctuation/hyphens as spaces
    .replace(/\s+/g, ' ')
    .trim();
}

const POPULAR_SEARCHES = [
  'Homem-Aranha',
  'Rock in Rio',
  'BTS',
  'Demi Lovato',
  'Supergirl',
  'Todo Mundo em Pânico',
  'Maroon 5'
];

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';

  // Handle Ctrl+K shortcut and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input and fetch events cache when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(-1);

      // Preload / refresh events for search
      setLoading(true);
      fetch(`${apiUrl}/events?city=Todo%20o%20Brasil`)
        .then((res) => {
          if (!res.ok) throw new Error('Falha ao buscar eventos');
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setAllEvents(data);
          }
        })
        .catch((err) => {
          console.error('Erro ao carregar catálogo para busca:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setQuery('');
      setFilteredEvents([]);
      setSelectedIndex(-1);
    }
  }, [isOpen, apiUrl]);

  // Filter events when query or allEvents change
  useEffect(() => {
    if (!query.trim()) {
      setFilteredEvents([]);
      setSelectedIndex(-1);
      return;
    }

    const queryWords = normalizeText(query).split(' ').filter(Boolean);
    if (queryWords.length === 0) {
      setFilteredEvents([]);
      return;
    }

    const matches = allEvents.filter((event: any) => {
      const normTitle = normalizeText(event.title || '');
      const normDesc = normalizeText(event.description || '');
      const normCategory = normalizeText(event.category || '');
      const normLocation = normalizeText(event.location || '');
      const normCity = normalizeText(event.city || '');
      const normType = normalizeText(event.type === 'MOVIE' ? 'filme cinema' : 'show festival');

      return queryWords.every(
        (word) =>
          normTitle.includes(word) ||
          normDesc.includes(word) ||
          normCategory.includes(word) ||
          normLocation.includes(word) ||
          normCity.includes(word) ||
          normType.includes(word)
      );
    });

    // Deduplicate by externalId or title to show unique cards
    const grouped = Object.values(
      matches.reduce((acc: any, event: any) => {
        const key = event.externalId || event.title;
        if (!acc[key]) {
          acc[key] = event;
        }
        return acc;
      }, {})
    ) as any[];

    setFilteredEvents(grouped);
    setSelectedIndex(-1);
  }, [query, allEvents]);

  // Keyboard navigation for results
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (filteredEvents.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredEvents.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredEvents.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredEvents.length) {
        const selected = filteredEvents[selectedIndex];
        handleSelectEvent(selected.id);
      } else if (filteredEvents.length > 0) {
        handleSelectEvent(filteredEvents[0].id);
      }
    }
  };

  const handleSelectEvent = (eventId: string) => {
    setIsOpen(false);
    router.push(`/evento/${eventId}`);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          border: '1px solid var(--border-glass)',
          background: 'rgba(255, 255, 255, 0.04)',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          transition: 'all 0.2s ease',
          fontSize: '0.875rem'
        }}
        title="Pesquisar eventos (Ctrl+K)"
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-neon)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-glass)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        <SearchIcon />
        <span>Buscar</span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '8vh',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          padding: '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--background-dark, #0d0f17)',
          borderRadius: '16px',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.1)'
        }}
      >
        {/* Search Header Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1.1rem 1.25rem',
            borderBottom: '1px solid var(--border-glass)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <SearchIcon className="text-secondary" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por filmes, shows, festivais ou cidades..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '1.1rem',
              width: '100%',
              marginLeft: '0.85rem',
              marginRight: '0.5rem',
              outline: 'none'
            }}
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.2rem 0.5rem',
                fontSize: '1.1rem',
                lineHeight: 1,
                borderRadius: '50%',
                marginRight: '0.5rem'
              }}
              title="Limpar busca"
            >
              ✕
            </button>
          )}

          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}
          >
            ESC
          </button>
        </div>

        {/* Search Content */}
        <div ref={listRef} style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {loading && allEvents.length === 0 && (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'inline-block', marginBottom: '0.5rem' }}>Carregando eventos...</div>
            </div>
          )}

          {/* No results */}
          {!loading && query.trim() && filteredEvents.length === 0 && (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                Nenhum evento encontrado para &quot;{query}&quot;
              </h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Verifique a ortografia ou tente buscar por termos mais genéricos.
              </p>
            </div>
          )}

          {/* Results List */}
          {filteredEvents.map((event, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={event.id}
                onClick={() => handleSelectEvent(event.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.9rem 1.25rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  setSelectedIndex(index);
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <img
                  src={getImageUrl(event.posterUrl)}
                  alt={event.title}
                  style={{
                    width: '46px',
                    height: '66px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    marginRight: '1rem',
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)'
                  }}
                  onError={(e) => {
                    // Fallback se imagem quebrar
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&q=80';
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {event.title}
                    </h4>
                    {event.rating && <RatingBadge rating={event.rating} />}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.825rem',
                      color: 'var(--text-secondary)',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {event.type === 'MOVIE' ? (
                        <>
                          <FilmIcon /> Filme
                        </>
                      ) : (
                        <>
                          <MusicIcon /> Show
                        </>
                      )}
                    </span>
                    <span>•</span>
                    <span>{event.location || event.city}</span>
                    {event.price !== undefined && (
                      <>
                        <span>•</span>
                        <span style={{ color: 'var(--accent-neon)', fontWeight: '500' }}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(event.price)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ marginLeft: '1rem', flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: 'var(--text-primary)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    Ver ingressos →
                  </span>
                </div>
              </div>
            );
          })}

          {/* Initial State / Suggested Searches */}
          {!query.trim() && (
            <div style={{ padding: '1.5rem 1.25rem' }}>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem'
                }}
              >
                Buscas Populares
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {POPULAR_SEARCHES.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setQuery(item);
                      inputRef.current?.focus();
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-primary)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 240, 255, 0.15)';
                      e.currentTarget.style.borderColor = 'var(--accent-neon)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>Navegue com ↑ ↓ e pressione Enter</span>
                <span>ESC para fechar</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

