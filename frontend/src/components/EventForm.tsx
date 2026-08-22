'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl, TMDbMovie } from '@/lib/tmdb';
import { useRouter } from 'next/navigation';
import { EventService } from '@/services/EventService';
import { maskCurrency, getCurrencyNumber, maskInteger } from '@/utils/masks';

export default function EventForm({ movie }: { movie: TMDbMovie }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    date: '',
    location: 'Cine Araújo - Sala VIP 1',
    price: 45.00,
    capacity: 50,
    maxTicketsPerUser: 4,
    city: ''
  });

  const [selectedState, setSelectedState] = useState('');
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
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
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?orderBy=nome`)
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error('Erro ao buscar cidades', err));
  }, [selectedState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await EventService.createEvent({
        externalId: String(movie.id),
        title: movie.title,
        description: movie.overview,
        posterUrl: getImageUrl(movie.poster_path),
        backdropUrl: getImageUrl(movie.backdrop_path),
        date: new Date(formData.date).toISOString(),
        location: formData.location,
        city: formData.city,
        price: formData.price,
        capacity: formData.capacity,
        maxTicketsPerUser: formData.maxTicketsPerUser
      });
      
      alert('Evento publicado com sucesso!');
      setIsOpen(false);
      router.push('/'); // Redireciona para a home para ver o evento
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <div 
        className="glass-panel" 
        style={{ cursor: 'pointer', overflow: 'hidden', transition: 'all 0.3s' }}
        onClick={() => setIsOpen(true)}
      >
        <Image 
          src={getImageUrl(movie.poster_path)} 
          alt={movie.title} 
          width={300} 
          height={450} 
          style={{ width: '100%', height: 'auto', objectFit: 'cover', transition: 'transform 0.3s' }}
        />
        <div style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lançamento: {movie.release_date}</p>
        </div>
      </div>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="neon-text">Publicar: {movie.title}</h2>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Data e Hora</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.5)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Estado (UF)</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      paddingRight: '2.5rem',
                      borderRadius: '8px', 
                      border: '1px solid var(--border-glass)', 
                      backgroundColor: 'rgba(0,0,0,0.5)', 
                      color: 'white',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f8fafc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1em'
                    }}
                  >
                    <option value="" style={{ color: 'black' }}>Selecione o Estado</option>
                    {states.map(state => (
                      <option key={state.id} value={state.sigla} style={{ color: 'black' }}>{state.nome}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Cidade</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                    disabled={!selectedState || cities.length === 0}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      paddingRight: '2.5rem',
                      borderRadius: '8px', 
                      border: '1px solid var(--border-glass)', 
                      backgroundColor: 'rgba(0,0,0,0.5)', 
                      color: 'white', 
                      opacity: (!selectedState || cities.length === 0) ? 0.5 : 1,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f8fafc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1em'
                    }}
                  >
                    <option value="" style={{ color: 'black' }}>Selecione a Cidade</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.nome} style={{ color: 'black' }}>{city.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Local (Sala/Cinema)</label>
                <input 
                  type="text" 
                  required 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.5)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Preço (R$)</label>
                  <input 
                    type="text" 
                    required 
                    value={maskCurrency(formData.price)}
                    onChange={(e) => setFormData({...formData, price: getCurrencyNumber(e.target.value)})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.5)', color: 'white' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Capacidade (Assentos)</label>
                  <input 
                    type="text" 
                    required 
                    value={maskInteger(formData.capacity)}
                    onChange={(e) => setFormData({...formData, capacity: Number(maskInteger(e.target.value))})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.5)', color: 'white' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Limite de Ingressos por Cliente</label>
                <input 
                  type="text" 
                  required 
                  value={maskInteger(formData.maxTicketsPerUser)}
                  onChange={(e) => setFormData({...formData, maxTicketsPerUser: Number(maskInteger(e.target.value))})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.5)', color: 'white' }}
                />
              </div>

              <button type="submit" className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`} style={{ marginTop: '1rem' }} disabled={loading}>
                {loading ? 'Publicando...' : 'Publicar Evento e Gerar Assentos'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
