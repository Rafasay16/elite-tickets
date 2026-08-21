'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, MapPinIcon } from '@/components/Icons';
import { EventService } from '@/services/EventService';

type Event = {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  status: string;
};

type Seat = {
  id: string;
  row: string;
  number: number;
  status: string;
};

export default function OrganizadorDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const router = useRouter();

  // Modal Novo Evento
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Show', date: '', location: '', cep: '', price: 0, capacity: 50, maxTicketsPerUser: 4, base64Image: ''
  });
  const [creating, setCreating] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Modal Cortesia
  const [isCortesiaModalOpen, setIsCortesiaModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loadingSeats, setLoadingSeats] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await EventService.listOrganizerEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, base64Image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await EventService.createEvent({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        location: formData.location,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        maxTicketsPerUser: Number(formData.maxTicketsPerUser),
        posterUrl: formData.base64Image
      });
      setIsEventModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      alert(err.message);
    }
    setCreating(false);
  };

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          location: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
        }));
      }
    } catch (e) {
      console.error("Erro ao buscar CEP", e);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, cep: val }));
    if (val.replace(/\D/g, '').length === 8) {
      fetchAddressByCep(val);
    }
  };

  const toggleEventStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'PAUSED' : 'PUBLISHED';
    try {
      await EventService.toggleStatus(id, newStatus);
      fetchEvents();
    } catch (e) {
      alert('Erro ao alterar status');
    }
  };

  const openCortesiaModal = async (eventId: string) => {
    setSelectedEventId(eventId);
    setIsCortesiaModalOpen(true);
    setLoadingSeats(true);
    setSeats([]);
    setSelectedSeat(null);
    setGuestName('');
    setGuestEmail('');
    
    try {
      const seats = await EventService.getCortesiaSeats(eventId);
      setSeats(seats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleIssueCortesia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat || !selectedEventId) {
      alert('Selecione um assento'); return;
    }
    try {
      await EventService.issueCortesia(selectedEventId, selectedSeat.id, guestName, guestEmail);
      alert('Cortesia emitida com sucesso!');
      setIsCortesiaModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredEvents = events.filter(evt => {
    if (!dateFilter) return true;
    const evtDate = new Date(evt.date).toISOString().split('T')[0];
    return evtDate === dateFilter;
  });

  return (
    <main className="container" style={{ padding: '4rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="neon-text" style={{ marginBottom: '0.5rem' }}>Painel de Eventos</h1>
          <p className="text-secondary">Crie, pause e emita cortesias para os seus eventos.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="date" 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
          />
          <button className="btn btn-primary" onClick={() => setIsEventModalOpen(true)}>
            + Criar Evento
          </button>
        </div>
      </div>

      {loading ? <p>Carregando...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredEvents.map(evt => {
            const isPaused = evt.status === 'PAUSED';
            return (
              <div key={evt.id} className="glass-panel" style={{ padding: '1.5rem', opacity: isPaused ? 0.6 : 1, position: 'relative' }}>
                {isPaused && (
                  <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--danger)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    PAUSADO
                  </span>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ marginBottom: '0.5rem', paddingRight: '4rem' }}>{evt.title}</h3>
                </div>
                <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '1rem' }}>
                  {evt.category || 'Geral'}
                </span>
                
                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <MapPinIcon /> {evt.location}
                </p>
                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon /> {new Date(evt.date).toLocaleString('pt-BR')}
                </p>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                    onClick={() => openCortesiaModal(evt.id)}
                    disabled={isPaused}
                  >
                    Cortesias
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                    onClick={() => toggleEventStatus(evt.id, evt.status)}
                  >
                    {isPaused ? 'Publicar' : 'Pausar'}
                  </button>
                </div>
              </div>
            );
          })}
          {filteredEvents.length === 0 && (
            <p className="text-secondary" style={{ gridColumn: '1 / -1' }}>Nenhum evento encontrado.</p>
          )}
        </div>
      )}

      {/* Modal Criar Evento */}
      {isEventModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="neon-text">Criar Novo Evento</h3>
              <button onClick={() => setIsEventModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>
            
            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Título do Evento</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Categoria</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}>
                    <option value="Show">Show</option>
                    <option value="Teatro">Teatro</option>
                    <option value="Cinema">Cinema</option>
                    <option value="E-sports">E-sports</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Data e Hora</label>
                  <input required type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '150px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                    CEP {loadingCep && <span style={{ color: 'var(--accent-neon)', fontSize: '0.7rem' }}>(Buscando...)</span>}
                  </label>
                  <input type="text" placeholder="Apenas números" maxLength={9} value={formData.cep} onChange={handleCepChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Local Completo</label>
                  <input required type="text" placeholder="Logradouro, número, bairro..." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Capacidade (Lotação)</label>
                  <input required type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Preço Base (R$)</label>
                  <input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Descrição</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Pôster (Imagem)</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', color: 'var(--text-secondary)' }} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating} style={{ marginTop: '1rem' }}>
                {creating ? 'Criando...' : 'Publicar Evento'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Emitir Cortesia */}
      {isCortesiaModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="neon-text">Emitir Cortesia</h3>
              <button onClick={() => setIsCortesiaModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>
            
            {loadingSeats ? <p>Carregando assentos...</p> : (
              <form onSubmit={handleIssueCortesia} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Selecione um Assento Livre</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    {seats.map(seat => (
                      <button 
                        key={seat.id} type="button"
                        onClick={() => setSelectedSeat(seat)}
                        disabled={seat.status !== 'AVAILABLE'}
                        style={{
                          padding: '0.5rem', borderRadius: '4px', border: 'none',
                          background: selectedSeat?.id === seat.id ? 'var(--accent-neon)' : (seat.status === 'AVAILABLE' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)'),
                          color: selectedSeat?.id === seat.id ? 'black' : (seat.status === 'AVAILABLE' ? 'white' : 'transparent'),
                          cursor: seat.status === 'AVAILABLE' ? 'pointer' : 'not-allowed'
                        }}
                        title={`Fila ${seat.row} - Assento ${seat.number}`}
                      >
                        {seat.row}{seat.number}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Nome do Convidado (Opcional)</label>
                  <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>E-mail do Convidado (Opcional)</label>
                  <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={!selectedSeat} style={{ marginTop: '1rem' }}>
                  Gerar Ingresso VIP
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
