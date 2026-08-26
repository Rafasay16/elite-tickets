'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { CalendarIcon } from './Icons';

export default function SessionPicker({ sessions, currentSessionId }: { sessions: any[], currentSessionId: string }) {
  const router = useRouter();

  // Agrupar por data (dia)
  const sessionsByDay = useMemo(() => {
    return sessions.reduce((acc: any, session: any) => {
      const dateObj = new Date(session.date);
      const dayKey = dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
      if (!acc[dayKey]) acc[dayKey] = [];
      acc[dayKey].push(session);
      return acc;
    }, {});
  }, [sessions]);

  const days = Object.keys(sessionsByDay);

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <CalendarIcon />
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading-family)', fontWeight: '700' }}>
          Escolha a Sessão / Horário
        </h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {days.map(day => (
          <div key={day} className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'var(--background-card)' }}>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.85rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
              {day}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {sessionsByDay[day].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((session: any) => {
                const time = new Date(session.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const isSelected = session.id === currentSessionId;
                
                return (
                  <button
                    key={session.id}
                    onClick={() => router.push(`/evento/${session.id}`)}
                    style={{
                      padding: '0.65rem 1.4rem',
                      borderRadius: '12px',
                      background: isSelected ? 'var(--accent-neon)' : 'rgba(125, 125, 125, 0.08)',
                      color: isSelected ? '#ffffff' : 'var(--text-primary)',
                      border: isSelected ? '1px solid var(--accent-neon)' : '1px solid var(--border-glass)',
                      boxShadow: isSelected ? '0 0 15px var(--accent-neon-glow)' : 'none',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontFamily: 'var(--font-heading-family)',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <span>{time}</span>
                    {isSelected && (
                      <span style={{ fontSize: '0.7rem', opacity: 0.9, background: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.4rem', borderRadius: '6px' }}>
                        Atual
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
