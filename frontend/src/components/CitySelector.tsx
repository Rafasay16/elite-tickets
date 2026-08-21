'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPinIcon } from '@/components/Icons';

export default function CitySelector({ initialCity }: { initialCity: string }) {
  const [showModal, setShowModal] = useState(false);
  const [city, setCity] = useState(initialCity);
  const router = useRouter();

  const handleSave = () => {
    document.cookie = `city=${encodeURIComponent(city)}; path=/; max-age=31536000`; // 1 ano
    setShowModal(false);
    router.refresh();
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)} 
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)',
          padding: '0.4rem 1rem', borderRadius: '999px', color: 'var(--text-primary)',
          cursor: 'pointer', transition: 'all 0.2s'
        }}
        className="city-btn"
      >
        <MapPinIcon />
        <span style={{ fontSize: '0.875rem' }}>{initialCity}</span>
      </button>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Sua Localização</h2>
            <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Selecione a cidade para ver os eventos disponíveis perto de você.
            </p>
            
            <input 
              type="text" 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              placeholder="Digite sua cidade (ex: Campina Grande)"
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px',
                border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.05)',
                color: 'white', marginBottom: '1.5rem'
              }}
            />
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
