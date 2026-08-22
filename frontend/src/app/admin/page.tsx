'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, MapPinIcon, GearIcon, TrashIcon } from '@/components/Icons';
import { EventService } from '@/services/EventService';
import { maskCEP, maskCurrency, getCurrencyNumber, maskInteger } from '@/utils/masks';

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
  const [categoryFilter, setCategoryFilter] = useState('');
  const router = useRouter();

  // Modal Calendario
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

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

  // Modal Conta Portaria
  const [isPortariaModalOpen, setIsPortariaModalOpen] = useState(false);
  const [porteiros, setPorteiros] = useState<any[]>([]);
  const [portariaData, setPortariaData] = useState({ name: '', email: '', password: 'eliteportaria' });
  const [creatingPortaria, setCreatingPortaria] = useState(false);
  const [loadingPorteiros, setLoadingPorteiros] = useState(false);

  // Settings da Portaria
  const [selectedPorteiroForSettings, setSelectedPorteiroForSettings] = useState<any>(null);
  const [newPorteiroPassword, setNewPorteiroPassword] = useState('');
  const [porteiroLogs, setPorteiroLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchPorteiros = async () => {
    setLoadingPorteiros(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
      const res = await fetch(`${apiUrl}/users/porteiros`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPorteiros(data);
      }
    } catch(e) {}
    setLoadingPorteiros(false);
  };

  const openPortariaModal = () => {
    setIsPortariaModalOpen(true);
    fetchPorteiros();
  };

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
        date: new Date(formData.date).toISOString(),
        location: formData.location,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        maxTicketsPerUser: Number(formData.maxTicketsPerUser),
        posterUrl: formData.base64Image || undefined
      });
      alert('Evento publicado com sucesso!');
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
    const val = maskCEP(e.target.value);
    setFormData(prev => ({ ...prev, cep: val }));
    if (val.replace(/\D/g, '').length === 8) {
      fetchAddressByCep(val);
    }
  };

  const toggleEventStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await EventService.toggleStatus(id, newStatus);
      fetchEvents();
    } catch (e: any) {
      alert(`Erro ao alterar status: ${e.message}`);
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

  const handleCreatePortaria = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPortaria(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
      const res = await fetch(`${apiUrl}/users/porteiros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(portariaData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar conta');
      
      alert('Conta de portaria criada com sucesso!');
      setPortariaData({ name: '', email: '', password: 'eliteportaria' });
      fetchPorteiros(); // Atualiza a lista na hora
    } catch (err: any) {
      alert(err.message);
    }
    setCreatingPortaria(false);
  };

  const handleDeletePorteiro = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta de portaria? O acesso dela será revogado imediatamente.')) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
      const res = await fetch(`${apiUrl}/users/porteiros/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPorteiros(prev => prev.filter(p => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao excluir');
      }
    } catch (e) {
      alert('Erro de conexão');
    }
  };

  const openPorteiroSettings = async (porteiro: any) => {
    setSelectedPorteiroForSettings(porteiro);
    setNewPorteiroPassword('');
    setPorteiroLogs([]);
    setLoadingLogs(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
      const res = await fetch(`${apiUrl}/users/porteiros/${porteiro.id}/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPorteiroLogs(data);
      }
    } catch(e) {}
    setLoadingLogs(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPorteiroPassword) return;
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
      const res = await fetch(`${apiUrl}/users/porteiros/${selectedPorteiroForSettings.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: newPorteiroPassword })
      });
      if (res.ok) {
        alert('Senha redefinida com sucesso!');
        setNewPorteiroPassword('');
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao redefinir senha');
      }
    } catch(e) {
      alert('Erro de conexão');
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const prevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));

  const renderCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: '0.75rem' }} />);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = dateFilter === dateStr;
      
      days.push(
        <button 
          key={i} 
          onClick={() => { setDateFilter(dateStr); setIsCalendarModalOpen(false); }}
          style={{
            padding: '0.5rem',
            background: isSelected ? 'var(--accent-neon)' : 'rgba(255,255,255,0.05)',
            color: isSelected ? '#000' : 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: isSelected ? 'bold' : 'normal',
            transition: 'all 0.2s',
            aspectRatio: '1/1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={e => {
            if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseOut={e => {
            if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
        >
          {i}
        </button>
      );
    }
    
    return days;
  };

  const filteredEvents = events.filter(evt => {
    let matchesDate = true;
    let matchesCategory = true;
    
    if (dateFilter) {
      const evtDate = new Date(evt.date).toISOString().split('T')[0];
      matchesDate = evtDate === dateFilter;
    }
    
    if (categoryFilter) {
      matchesCategory = (evt.category || 'Geral') === categoryFilter;
    }
    
    return matchesDate && matchesCategory;
  });

  const categories = Array.from(new Set(events.map(e => e.category || 'Geral')));

  const groupedEvents = filteredEvents.reduce((acc, evt) => {
    const cat = evt.category || 'Geral';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(evt);
    return acc;
  }, {} as Record<string, Event[]>);

  return (
    <main className="container" style={{ padding: '4rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="neon-text" style={{ marginBottom: '0.5rem' }}>Painel de Eventos</h1>
          <p className="text-secondary">Crie, pause e emita cortesias para os seus eventos.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="btn btn-secondary"
            style={{ 
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              paddingRight: '2.5rem',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f8fafc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1em'
            }}
          >
            <option value="" style={{ background: '#0f172a', color: 'white' }}>Todas as Categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat} style={{ background: '#0f172a', color: 'white' }}>{cat}</option>
            ))}
          </select>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setIsCalendarModalOpen(true)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                background: dateFilter ? 'var(--accent-neon)' : undefined, 
                color: dateFilter ? '#000' : undefined 
              }}
            >
              <CalendarIcon />
              {dateFilter ? new Date(dateFilter + 'T12:00:00').toLocaleDateString('pt-BR') : 'Filtrar por Data'}
            </button>
            {dateFilter && (
              <button 
                onClick={() => setDateFilter('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.5rem', padding: '0 0.5rem', marginLeft: '0.2rem' }}
                title="Limpar data"
              >
                &times;
              </button>
            )}
          </div>
          <button className="btn btn-secondary" onClick={openPortariaModal}>
            Gerenciar Equipe
          </button>
          <button className="btn btn-secondary" onClick={() => router.push('/portaria')}>
            Ler QR Code
          </button>
          <button className="btn btn-primary" onClick={() => setIsEventModalOpen(true)}>
            + Criar Evento
          </button>
        </div>
      </div>

      {loading ? <p>Carregando...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(groupedEvents).length === 0 ? (
            <p className="text-secondary">Nenhum evento encontrado.</p>
          ) : (
            Object.entries(groupedEvents).map(([category, catEvents]) => (
              <div key={category}>
                <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.25rem' }}>{category}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {catEvents.map(evt => {
                    const isPaused = evt.status === 'PAUSED' || evt.status === 'DRAFT';
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
                </div>
              </div>
            ))
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
                  <select 
                    required 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      paddingRight: '2.5rem',
                      borderRadius: '8px', 
                      backgroundColor: 'rgba(0,0,0,0.3)', 
                      border: '1px solid var(--border-glass)', 
                      color: 'white',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f8fafc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1em'
                    }}
                  >
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
                  <input type="text" placeholder="00000-000" maxLength={9} value={formData.cep} onChange={handleCepChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Local Completo</label>
                  <input required type="text" placeholder="Logradouro, número, bairro..." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Capacidade (Lotação)</label>
                  <input required type="text" value={formData.capacity === 0 ? '' : maskInteger(formData.capacity)} onChange={e => setFormData({...formData, capacity: Number(maskInteger(e.target.value))})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Preço Base (R$)</label>
                  <input required type="text" value={maskCurrency(formData.price)} onChange={e => setFormData({...formData, price: getCurrencyNumber(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
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

      {/* Modal Gerenciar Portaria */}
      {isPortariaModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="neon-text">Gerenciar Equipe (Portaria)</h3>
              <button onClick={() => setIsPortariaModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>Contas Ativas</h4>
              {loadingPorteiros ? <p>Carregando...</p> : porteiros.length === 0 ? <p className="text-secondary" style={{ fontSize: '0.8rem' }}>Nenhuma conta criada ainda.</p> : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {porteiros.map(p => (
                    <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px' }}>
                      <div>
                        <span style={{ display: 'block', fontWeight: 'bold' }}>{p.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.email}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openPorteiroSettings(p)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.2rem' }} title="Configurações">
                          <GearIcon size={20} />
                        </button>
                        <button onClick={() => handleDeletePorteiro(p.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }} title="Revogar acesso">
                          <TrashIcon size={20} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>Cadastrar Novo Membro</h4>
            <form onSubmit={handleCreatePortaria} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Nome (Ex: &quot;Equipe Setor A&quot;)</label>
                <input required type="text" value={portariaData.name} onChange={e => setPortariaData({...portariaData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>E-mail de Login</label>
                <input required type="email" value={portariaData.email} onChange={e => setPortariaData({...portariaData, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Senha de Acesso</label>
                <input required type="text" value={portariaData.password} onChange={e => setPortariaData({...portariaData, password: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={creatingPortaria} style={{ marginTop: '1rem' }}>
                {creatingPortaria ? 'Criando...' : 'Cadastrar e Liberar Acesso'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Configurações do Porteiro */}
      {selectedPorteiroForSettings && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="neon-text">Gerenciar: {selectedPorteiroForSettings.name}</h3>
              <button onClick={() => setSelectedPorteiroForSettings(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>Redefinir Senha</h4>
              <form onSubmit={handleResetPassword} style={{ display: 'flex', gap: '0.5rem' }}>
                <input required type="text" placeholder="Nova senha" value={newPorteiroPassword} onChange={e => setNewPorteiroPassword(e.target.value)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }} />
                <button type="submit" className="btn btn-primary">Salvar</button>
              </form>
            </div>

            <div>
              <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>Últimas Validações</h4>
              {loadingLogs ? <p>Carregando histórico...</p> : porteiroLogs.length === 0 ? <p className="text-secondary" style={{ fontSize: '0.8rem' }}>Nenhum ingresso bipado ainda.</p> : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {porteiroLogs.map((log: any) => (
                    <li key={log.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{log.event?.title}</span>
                        <span style={{ color: 'var(--accent-neon)' }}>{new Date(log.scannedAt).toLocaleTimeString('pt-BR')}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        Fila {log.seat?.row} - Num {log.seat?.number}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Calendário */}
      {isCalendarModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="neon-text">Filtrar por Data</h3>
              <button onClick={() => setIsCalendarModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <button onClick={prevMonth} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>&lt;</button>
              <h4 style={{ margin: 0 }}>{monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</h4>
              <button onClick={nextMonth} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>&gt;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
              {renderCalendar()}
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => { setDateFilter(''); setIsCalendarModalOpen(false); }}
                style={{ width: '100%' }}
              >
                Limpar Filtro
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
