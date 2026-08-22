'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon, FilmIcon, MusicIcon } from './Icons';
import { getImageUrl } from '@/lib/tmdb';

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Fetch all events on first open or just fetch based on query?
  // Since we want to search all of Brazil, we can fetch all and filter in memory, 
  // or fetch dynamically. Let's fetch dynamically with debounce for better practice.
  useEffect(() => {
    if (!query) {
      setEvents([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:3333/api/events?city=Todo o Brasil`);
        if (res.ok) {
          const allEvents = await res.json();
          // Filter in memory by title
          const filtered = allEvents.filter((e: any) => e.title.toLowerCase().includes(query.toLowerCase()));
          
          // Deduplicate by title
          const grouped = Object.values(filtered.reduce((acc: any, event: any) => {
            const key = event.title;
            if (!acc[key]) {
              acc[key] = event;
            }
            return acc;
          }, {}));
          
          setEvents(grouped as any[]);
        }
      } catch (err) {
        console.error('Erro na busca', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          border: '1px solid var(--border-glass)',
          background: 'rgba(255, 255, 255, 0.03)',
          cursor: 'pointer',
          color: 'var(--text-secondary)'
        }}
        title="Pesquisar (Ctrl+K)"
      >
        <SearchIcon />
        <span style={{ fontSize: '0.85rem' }}>Buscar</span>
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: '10vh'
    }} onClick={() => setIsOpen(false)}>
      
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '600px',
          padding: '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--background-dark)', /* fundo solido de verdade */
          borderRadius: '12px',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}
      >
        {/* Search Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
          <SearchIcon className="text-secondary" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por filmes ou shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '1.2rem',
              width: '100%',
              marginLeft: '1rem',
              outline: 'none'
            }}
          />
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {loading && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Buscando...</div>}
          
          {!loading && query && events.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Nenhum evento encontrado para &quot;{query}&quot;
            </div>
          )}

          {!loading && events.map((event) => (
            <div 
              key={event.id}
              onClick={() => {
                setIsOpen(false);
                router.push(`/evento/${event.id}`);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <img 
                src={getImageUrl(event.posterUrl)} 
                alt={event.title} 
                style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: '4px', marginRight: '1rem' }}
              />
              <div>
                <h4 style={{ margin: '0 0 0.25rem' }}>{event.title}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {event.type === 'MOVIE' ? <><FilmIcon /> Filme</> : <><MusicIcon /> Show</>} • {event.category || 'Várias Sessões'}
                </div>
              </div>
            </div>
          ))}

          {!query && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Digite o nome de um evento para buscar em Todo o Brasil.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
