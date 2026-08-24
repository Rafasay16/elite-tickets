'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { MapPinIcon } from '@/components/Icons';

export default function CitySelector({ initialCity }: { initialCity: string }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Carrega os estados do IBGE
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then(data => setStates(data))
      .catch(err => console.error('Erro ao buscar estados', err));
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      return;
    }
    // Carrega as cidades do estado selecionado
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?orderBy=nome`)
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error('Erro ao buscar cidades', err));
  }, [selectedState]);

  const handleSaveCity = (cityName: string) => {
    document.cookie = `city=${encodeURIComponent(cityName)}; path=/; max-age=31536000`; // 1 ano
    setShowModal(false);
    router.refresh();
  };

  const handleManualSave = () => {
    if (!selectedCity) return alert('Selecione uma cidade primeiro.');
    handleSaveCity(selectedCity);
  };

  const handleAllBrazil = () => {
    handleSaveCity('Todo o Brasil');
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Seu navegador não suporta geolocalização.');
      return;
    }

    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        console.log("Localização obtida:", latitude, longitude);
        
        // Usa Nominatim (OpenStreetMap) para Reverse Geocoding gratuito
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
        if (!res.ok) throw new Error('Falha ao buscar cidade no Nominatim');
        
        const data = await res.json();
        
        const city = data.address.city || data.address.town || data.address.village || data.address.municipality;
        if (city) {
          handleSaveCity(city);
        } else {
          alert('Não foi possível identificar a sua cidade a partir da localização. Tente selecionar manualmente.');
        }
      } catch (err) {
        console.error('Erro no geocoding:', err);
        alert('Erro ao processar localização. A API pode estar indisponível, tente manualmente.');
      } finally {
        setLoadingGeo(false);
      }
    }, (error) => {
      setLoadingGeo(false);
      console.error('Erro Geolocation:', error);
      alert('Não foi possível obter sua localização (Tempo esgotado ou bloqueado pelo sistema). Selecione o estado e a cidade manualmente.');
    }, {
      timeout: 15000, // Aumentado para 15 segundos
      enableHighAccuracy: false // Definido como false pois só precisamos da cidade, o GPS de alta precisão causa muito timeout
    });
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
        <span style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{initialCity}</span>
      </button>

      {mounted && showModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Sua Localização</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Descubra os melhores eventos perto de você.
            </p>

            <button 
              className="btn" 
              style={{ 
                width: '100%', 
                marginBottom: '1rem', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'var(--accent-neon)',
                color: '#000',
                fontWeight: 'bold'
              }} 
              onClick={handleGeolocation}
              disabled={loadingGeo}
            >
              <MapPinIcon /> {loadingGeo ? 'Buscando sua localização...' : 'Usar minha localização atual'}
            </button>

            <div style={{ textAlign: 'center', margin: '1.5rem 0', color: 'var(--text-secondary)', position: 'relative' }}>
              <hr style={{ borderColor: 'var(--border-glass)' }} />
              <span style={{ position: 'absolute', top: '-10px', background: 'var(--background-card)', padding: '0 10px', left: '50%', transform: 'translateX(-50%)' }}>ou informe manualmente</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estado (UF)</label>
                <select 
                  value={selectedState} 
                  onChange={(e) => setSelectedState(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.05)',
                    color: 'white'
                  }}
                >
                  <option value="" style={{ color: 'black' }}>Selecione o Estado</option>
                  {states.map(state => (
                    <option key={state.id} value={state.sigla} style={{ color: 'black' }}>{state.nome}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cidade</label>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedState || cities.length === 0}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.05)',
                    color: 'white', opacity: (!selectedState || cities.length === 0) ? 0.5 : 1
                  }}
                >
                  <option value="" style={{ color: 'black' }}>Selecione a Cidade</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.nome} style={{ color: 'black' }}>{city.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                marginBottom: '1.5rem',
                opacity: selectedCity ? 1 : 0.5,
                cursor: selectedCity ? 'pointer' : 'not-allowed'
              }} 
              onClick={handleManualSave}
              disabled={!selectedCity}
            >
              Confirmar Cidade Selecionada
            </button>

            <div style={{ textAlign: 'center' }}>
              <button onClick={handleAllBrazil} style={{ background: 'transparent', border: 'none', color: 'var(--accent-neon)', cursor: 'pointer', textDecoration: 'underline' }}>
                Ver eventos em Todo o Brasil
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
