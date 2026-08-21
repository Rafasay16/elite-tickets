'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSeatMap({ event, seats }: { event: any, seats: any[] }) {
  const [selectedSeat, setSelectedSeat] = useState<any | null>(null);
  
  const rows = Array.from(new Set(seats.map(s => s.row))).sort();

  return (
    <div>
      <div style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 100%)',
        height: '4px', width: '60%', margin: '0 auto 3rem auto', borderRadius: '50%',
        boxShadow: '0 10px 30px rgba(255,255,255,0.1)'
      }} />
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', letterSpacing: '0.3em', fontSize: '0.75rem', marginBottom: '3rem' }}>PALCO</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        {rows.map(row => (
          <div key={row} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ width: '20px', color: 'var(--text-secondary)', fontWeight: 600 }}>{row}</span>
            {seats.filter(s => s.row === row).sort((a,b) => a.number - b.number).map(seat => (
              <button
                key={seat.id}
                disabled={seat.status !== 'AVAILABLE'}
                onClick={() => setSelectedSeat(seat)}
                style={{
                  width: '32px', height: '32px', borderRadius: '6px',
                  background: seat.status !== 'AVAILABLE' ? 'rgba(255,255,255,0.05)' : selectedSeat?.id === seat.id ? 'var(--accent-neon)' : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${selectedSeat?.id === seat.id ? 'var(--accent-neon)' : 'rgba(255,255,255,0.1)'}`,
                  color: seat.status !== 'AVAILABLE' ? '#333' : '#fff',
                  cursor: seat.status !== 'AVAILABLE' ? 'not-allowed' : 'pointer',
                  fontSize: '0.75rem', transition: 'all 0.2s'
                }}
              >
                {seat.number}
              </button>
            ))}
            <span style={{ width: '20px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>{row}</span>
          </div>
        ))}
      </div>

      {selectedSeat && (
        <GiftForm event={event} seat={selectedSeat} onCancel={() => setSelectedSeat(null)} />
      )}
    </div>
  );
}

function GiftForm({ event, seat, onCancel }: { event: any, seat: any, onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestCpf, setGuestCpf] = useState('');

  const handleGift = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/gift-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          seatId: seat.id,
          guestName,
          guestEmail,
          guestCpf
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert('Cortesia gerada com sucesso!');
      onCancel(); // Fecha modal
      router.refresh(); // Atualiza assentos
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent-neon)' }}>Emitir Cortesia</h3>
        <p className="text-secondary" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
          Emitindo ingresso para o assento <strong>{seat.row}{seat.number}</strong>.
        </p>

        <form onSubmit={handleGift} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nome Completo</label>
            <input type="text" required value={guestName} onChange={e => setGuestName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>E-mail</label>
            <input type="email" required value={guestEmail} onChange={e => setGuestEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>CPF</label>
            <input type="text" required value={guestCpf} onChange={e => setGuestCpf(e.target.value)} placeholder="000.000.000-00" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: '#fff' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>{loading ? 'Processando...' : 'Confirmar Emissão'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
