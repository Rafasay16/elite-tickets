'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CalendarIcon, MapPinIcon, GearIcon, TrashIcon } from '@/components/Icons';
import { EventService } from '@/services/EventService';
import { maskCEP, maskCurrency, getCurrencyNumber, maskInteger } from '@/utils/masks';
import { getImageUrl } from '@/lib/tmdb';
import styles from './Admin.module.css';

type Event = {
  id: string;
  title: string;
  category: string;
  type: string;
  date: string;
  location: string;
  status: string;
  posterUrl?: string | null;
  capacity?: number;
  price?: number;
  seats?: any[];
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
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  // Modal Calendario
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Modal Novo Evento
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Show',
    date: '',
    location: '',
    cep: '',
    price: 0,
    capacity: 50,
    maxTicketsPerUser: 4,
    base64Image: '',
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

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await EventService.listOrganizerEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Global keydown for Escape dismiss on any active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEventModalOpen(false);
        setIsCortesiaModalOpen(false);
        setIsPortariaModalOpen(false);
        setSelectedPorteiroForSettings(null);
        setIsCalendarModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchPorteiros = async () => {
    setLoadingPorteiros(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
      const res = await fetch(`${apiUrl}/users/porteiros`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPorteiros(data);
      }
    } catch (e) {}
    setLoadingPorteiros(false);
  };

  const openPortariaModal = () => {
    setIsPortariaModalOpen(true);
    fetchPorteiros();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, base64Image: reader.result as string }));
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
        posterUrl: formData.base64Image || undefined,
      });
      showToast('Evento publicado com sucesso!', 'success');
      setIsEventModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'Show',
        date: '',
        location: '',
        cep: '',
        price: 0,
        capacity: 50,
        maxTicketsPerUser: 4,
        base64Image: '',
      });
      fetchEvents();
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar evento', 'error');
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
        setFormData((prev) => ({
          ...prev,
          location: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`,
        }));
      }
    } catch (e) {
      console.error('Erro ao buscar CEP', e);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = maskCEP(e.target.value);
    setFormData((prev) => ({ ...prev, cep: val }));
    if (val.replace(/\D/g, '').length === 8) {
      fetchAddressByCep(val);
    }
  };

  const toggleEventStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await EventService.toggleStatus(id, newStatus);
      showToast(newStatus === 'PUBLISHED' ? 'Evento ativado!' : 'Evento pausado.', 'success');
      fetchEvents();
    } catch (e: any) {
      showToast(`Erro ao alterar status: ${e.message}`, 'error');
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
      const cortesiaSeats = await EventService.getCortesiaSeats(eventId);
      setSeats(cortesiaSeats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleIssueCortesia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat || !selectedEventId) {
      showToast('Selecione um assento primeiro', 'error');
      return;
    }
    try {
      await EventService.issueCortesia(selectedEventId, selectedSeat.id, guestName, guestEmail);
      showToast('Cortesia emitida com sucesso!', 'success');
      setIsCortesiaModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Erro ao emitir cortesia', 'error');
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
        body: JSON.stringify(portariaData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar conta');

      showToast('Conta de portaria criada com sucesso!', 'success');
      setPortariaData({ name: '', email: '', password: 'eliteportaria' });
      fetchPorteiros();
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar conta', 'error');
    }
    setCreatingPortaria(false);
  };

  const handleDeletePorteiro = async (id: string) => {
    if (!confirm('Tem certeza que deseja revogar o acesso desta conta de portaria?')) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
      const res = await fetch(`${apiUrl}/users/porteiros/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPorteiros((prev) => prev.filter((p) => p.id !== id));
        showToast('Acesso de portaria revogado!', 'success');
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao excluir', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão', 'error');
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPorteiroLogs(data);
      }
    } catch (e) {}
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
        body: JSON.stringify({ password: newPorteiroPassword }),
      });
      if (res.ok) {
        showToast('Senha redefinida com sucesso!', 'success');
        setNewPorteiroPassword('');
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao redefinir senha', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão', 'error');
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

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
          type="button"
          onClick={() => {
            setDateFilter(dateStr);
            setIsCalendarModalOpen(false);
          }}
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
            justifyContent: 'center',
          }}
        >
          {i}
        </button>
      );
    }

    return days;
  };

  const getDisplayCategory = (evt: Event) => {
    if (evt.category) return evt.category;
    return evt.type === 'MOVIE' ? 'Cinema' : 'Show';
  };

  // KPIs Calculations
  const totalActive = useMemo(() => events.filter((e) => e.status === 'PUBLISHED').length, [events]);
  const totalPaused = useMemo(() => events.filter((e) => e.status !== 'PUBLISHED').length, [events]);
  const totalCapacity = useMemo(() => events.reduce((acc, curr) => acc + (curr.capacity || curr.seats?.length || 50), 0), [events]);

  const categories = useMemo(() => Array.from(new Set(events.map((e) => getDisplayCategory(e)))), [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      let matchesSearch = true;
      let matchesDate = true;
      let matchesCategory = true;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch = evt.title.toLowerCase().includes(q) || evt.location.toLowerCase().includes(q);
      }

      if (dateFilter) {
        const evtDate = new Date(evt.date).toISOString().split('T')[0];
        matchesDate = evtDate === dateFilter;
      }

      if (categoryFilter) {
        matchesCategory = getDisplayCategory(evt) === categoryFilter;
      }

      return matchesSearch && matchesDate && matchesCategory;
    });
  }, [events, searchQuery, dateFilter, categoryFilter]);

  return (
    <main className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem', maxWidth: '1200px' }}>
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div 
          style={{ 
            position: 'fixed', 
            top: '5.5rem', 
            right: '2rem', 
            zIndex: 1100, 
            padding: '0.85rem 1.4rem', 
            borderRadius: '12px', 
            background: toastMessage.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            backdropFilter: 'blur(8px)'
          }}
        >
          {toastMessage.text}
        </div>
      )}

      {/* HEADER DO DASHBOARD */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            Painel do <span className="text-gradient">Organizador</span>
          </h1>
          <p className={styles.subtitle}>
            Gerencie seus eventos, emita cortesias VIP e configure a equipe de validação de portaria.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={openPortariaModal}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <GearIcon size={16} />
            Gerenciar Equipe
          </button>

          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => router.push('/portaria')}
          >
            Acessar Portaria
          </button>

          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => setIsEventModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>+</span> Criar Evento
          </button>
        </div>
      </div>

      {/* CARDS DE KPIS EXECUTIVOS */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Eventos Totais</span>
            <span className={styles.kpiValue}>{events.length}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconGreen}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Em Cartaz / Ativos</span>
            <span className={styles.kpiValue}>{totalActive}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Capacidade Total</span>
            <span className={styles.kpiValue}>{totalCapacity}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconPurple}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Pausados / Rascunhos</span>
            <span className={styles.kpiValue}>{totalPaused}</span>
          </div>
        </div>
      </div>

      {/* BARRA DE CONTROLE & BUSCA */}
      <div className={styles.controlBar}>
        <div className={styles.filterGroup}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por título ou local..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="" style={{ background: '#0f172a' }}>Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} style={{ background: '#0f172a' }}>
                {cat}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              className={`${styles.dateFilterBtn} ${dateFilter ? styles.dateFilterActive : ''}`}
              onClick={() => setIsCalendarModalOpen(true)}
            >
              <CalendarIcon />
              {dateFilter ? new Date(dateFilter + 'T12:00:00').toLocaleDateString('pt-BR') : 'Filtrar por Data'}
            </button>
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className={styles.clearDateBtn}
                title="Limpar filtro de data"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Exibindo <strong style={{ color: 'var(--text-primary)' }}>{filteredEvents.length}</strong> de {events.length} eventos
        </div>
      </div>

      {/* GRADE DE EVENTOS */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <p className="text-secondary">Carregando seus eventos...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1.5rem', background: 'var(--background-card)', border: '1px solid var(--border-glass)', borderRadius: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading-family)', margin: '0 0 0.5rem 0' }}>Nenhum evento encontrado</h3>
          <p className="text-secondary" style={{ maxWidth: '400px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
            Não encontramos eventos correspondentes aos filtros aplicados. Tente redefinir a busca ou crie um novo evento.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setSearchQuery('');
              setDateFilter('');
              setCategoryFilter('');
            }}
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className={styles.eventsGrid}>
          {filteredEvents.map((evt) => {
            const isPaused = evt.status === 'PAUSED' || evt.status === 'DRAFT';
            return (
              <div
                key={evt.id}
                className={`${styles.eventCard} ${isPaused ? styles.eventCardPaused : ''}`}
              >
                <div className={styles.eventCardTop}>
                  <div className={styles.eventPosterWrapper}>
                    <Image
                      src={getImageUrl(evt.posterUrl || null)}
                      alt={`Pôster de ${evt.title}`}
                      fill
                      className={styles.eventPoster}
                      sizes="72px"
                    />
                  </div>

                  <div className={styles.eventHeaderInfo}>
                    <div className={styles.eventCategoryRow}>
                      <span className={styles.categoryTag}>{getDisplayCategory(evt)}</span>
                      <span className={isPaused ? styles.statusTagPaused : styles.statusTagActive}>
                        {isPaused ? 'Pausado' : 'Ativo'}
                      </span>
                    </div>

                    <h3 className={styles.eventTitle} title={evt.title}>
                      {evt.title}
                    </h3>

                    <div className={styles.eventMeta}>
                      <span className={styles.eventMetaItem}>
                        <CalendarIcon /> {new Date(evt.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <span className={styles.eventMetaItem} title={evt.location}>
                        <MapPinIcon /> {evt.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.eventCardFooter}>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                    onClick={() => openCortesiaModal(evt.id)}
                    disabled={isPaused}
                  >
                    Emitir Cortesia
                  </button>

                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
                    onClick={() => toggleEventStatus(evt.id, evt.status)}
                  >
                    {isPaused ? 'Publicar' : 'Pausar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CRIAR NOVO EVENTO */}
      {isEventModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsEventModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Criar Novo Evento</h3>
              <button type="button" className={styles.closeBtn} onClick={() => setIsEventModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Título do Evento
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Festival de Verão 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Categoria
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  >
                    <option value="Show" style={{ background: '#0f172a' }}>Show</option>
                    <option value="Teatro" style={{ background: '#0f172a' }}>Teatro</option>
                    <option value="Cinema" style={{ background: '#0f172a' }}>Cinema</option>
                    <option value="E-sports" style={{ background: '#0f172a' }}>E-sports</option>
                    <option value="Outros" style={{ background: '#0f172a' }}>Outros</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Data e Horário
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    CEP {loadingCep && <span style={{ color: 'var(--accent-neon)' }}>(Buscando...)</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="00000-000"
                    maxLength={9}
                    value={formData.cep}
                    onChange={handleCepChange}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Endereço Completo
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Logradouro, número, bairro, cidade..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Lotação Máxima
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.capacity === 0 ? '' : maskInteger(formData.capacity)}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(maskInteger(e.target.value)) })}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Preço Base (R$)
                  </label>
                  <input
                    required
                    type="text"
                    value={maskCurrency(formData.price)}
                    onChange={(e) => setFormData({ ...formData, price: getCurrencyNumber(e.target.value) })}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Descrição do Evento
                </label>
                <textarea
                  rows={3}
                  placeholder="Informações adicionais, classificação indicativa e atrações..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Pôster / Imagem de Divulgação
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ width: '100%', color: 'var(--text-secondary)' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
                style={{ marginTop: '0.5rem', padding: '0.85rem' }}
              >
                {creating ? 'Publicando Evento...' : 'Publicar Evento'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EMITIR CORTESIA VIP */}
      {isCortesiaModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsCortesiaModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Emitir Cortesia VIP</h3>
              <button type="button" className={styles.closeBtn} onClick={() => setIsCortesiaModalOpen(false)}>
                &times;
              </button>
            </div>

            {loadingSeats ? (
              <p className="text-secondary" style={{ textAlign: 'center', padding: '2rem 0' }}>
                Carregando mapa de assentos...
              </p>
            ) : (
              <form onSubmit={handleIssueCortesia} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Selecione um Assento Disponível
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
                      gap: '0.5rem',
                      maxHeight: '160px',
                      overflowY: 'auto',
                      padding: '0.75rem',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-glass)',
                    }}
                  >
                    {seats.map((seat) => (
                      <button
                        key={seat.id}
                        type="button"
                        onClick={() => setSelectedSeat(seat)}
                        disabled={seat.status !== 'AVAILABLE'}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: selectedSeat?.id === seat.id
                            ? 'var(--accent-neon)'
                            : (seat.status === 'AVAILABLE' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)'),
                          color: selectedSeat?.id === seat.id
                            ? 'white'
                            : (seat.status === 'AVAILABLE' ? 'white' : 'transparent'),
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: seat.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                          transition: 'all 0.15s',
                        }}
                        title={`Fila ${seat.row} - Assento ${seat.number}`}
                      >
                        {seat.row}{seat.number}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Nome do Convidado (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Nome do VIP / Imprensa"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    E-mail do Convidado (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="convidado@vip.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!selectedSeat}
                  style={{ marginTop: '0.5rem', padding: '0.85rem' }}
                >
                  {selectedSeat ? `Emitir Cortesia (Assento ${selectedSeat.row}${selectedSeat.number})` : 'Selecione um assento'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: GERENCIAR EQUIPE DE PORTARIA */}
      {isPortariaModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsPortariaModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Equipe de Portaria</h3>
              <button type="button" className={styles.closeBtn} onClick={() => setIsPortariaModalOpen(false)}>
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Contas de Acesso Ativas</h4>
              {loadingPorteiros ? (
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Carregando equipe...</p>
              ) : porteiros.length === 0 ? (
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Nenhum membro cadastrado ainda.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {porteiros.map((p) => (
                    <li
                      key={p.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border-glass)',
                      }}
                    >
                      <div>
                        <span style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem' }}>{p.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.email}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => openPorteiroSettings(p)}
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}
                          title="Configurações e Logs"
                        >
                          <GearIcon size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePorteiro(p.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}
                          title="Revogar Acesso"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Novo Membro de Portaria</h4>
              <form onSubmit={handleCreatePortaria} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Nome da Equipe</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Portaria Principal Setor A"
                    value={portariaData.name}
                    onChange={(e) => setPortariaData({ ...portariaData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>E-mail de Login</label>
                  <input
                    required
                    type="email"
                    placeholder="portaria1@evento.com"
                    value={portariaData.email}
                    onChange={(e) => setPortariaData({ ...portariaData, email: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Senha Inicial</label>
                  <input
                    required
                    type="text"
                    value={portariaData.password}
                    onChange={(e) => setPortariaData({ ...portariaData, password: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={creatingPortaria} style={{ padding: '0.75rem' }}>
                  {creatingPortaria ? 'Cadastrando...' : 'Cadastrar Membro'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURAÇÕES E LOGS DO PORTEIRO */}
      {selectedPorteiroForSettings && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedPorteiroForSettings(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{selectedPorteiroForSettings.name}</h3>
              <button type="button" className={styles.closeBtn} onClick={() => setSelectedPorteiroForSettings(null)}>
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>Redefinir Senha de Acesso</h4>
              <form onSubmit={handleResetPassword} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  required
                  type="text"
                  placeholder="Nova senha"
                  value={newPorteiroPassword}
                  onChange={(e) => setNewPorteiroPassword(e.target.value)}
                  style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
                  Salvar
                </button>
              </form>
            </div>

            <div>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>Últimas Validações de QR Code</h4>
              {loadingLogs ? (
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Carregando histórico...</p>
              ) : porteiroLogs.length === 0 ? (
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Nenhum ingresso validado recentemente.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {porteiroLogs.map((log: any) => (
                    <li
                      key={log.id}
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        border: '1px solid var(--border-glass)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{log.event?.title}</span>
                        <span style={{ color: 'var(--accent-neon)' }}>{new Date(log.scannedAt).toLocaleTimeString('pt-BR')}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        Fila {log.seat?.row} - Assento {log.seat?.number}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CALENDÁRIO DE FILTRO */}
      {isCalendarModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsCalendarModalOpen(false)}>
          <div className={styles.modalContent} style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Filtrar por Data</h3>
              <button type="button" className={styles.closeBtn} onClick={() => setIsCalendarModalOpen(false)}>
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <button type="button" onClick={prevMonth} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                &lt;
              </button>
              <h4 style={{ margin: 0, fontFamily: 'var(--font-heading-family)' }}>
                {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </h4>
              <button type="button" onClick={nextMonth} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                &gt;
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
              {renderCalendar()}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setDateFilter('');
                  setIsCalendarModalOpen(false);
                }}
                style={{ width: '100%' }}
              >
                Limpar Filtro de Data
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
