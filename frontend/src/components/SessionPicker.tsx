'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export default function SessionPicker({ sessions, currentSessionId }: { sessions: any[], currentSessionId: string }) {
  const router = useRouter();

  // Agrupar por data (dia)
  const sessionsByDay = useMemo(() => {
    return sessions.reduce((acc: any, session: any) => {
      const dateObj = new Date(session.date);
      const dayKey = dateObj.toLocaleDateString('pt-BR');
      if (!acc[dayKey]) acc[dayKey] = [];
      acc[dayKey].push(session);
      return acc;
    }, {});
  }, [sessions]);

  const days = Object.keys(sessionsByDay).sort((a, b) => {
    const [d1, m1, y1] = a.split('/');
    const [d2, m2, y2] = b.split('/');
    return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
  });

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Escolha a Sessão</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {days.map(day => (
          <div key={day} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              {day}
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {sessionsByDay[day].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((session: any) => {
                const time = new Date(session.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const isSelected = session.id === currentSessionId;
                
                return (
                  <button
                    key={session.id}
                    onClick={() => router.push(`/evento/${session.id}`)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      background: isSelected ? 'var(--accent-neon)' : 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#000' : 'white',
                      border: isSelected ? 'none' : '1px solid var(--border-glass)',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    {time}
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
