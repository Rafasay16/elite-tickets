'use client';
import { useState, useEffect, useRef, useCallback } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

interface ValidationResult {
  status: 'success' | 'warning' | 'error';
  title: string;
  customerName?: string;
  scannedAt?: string | Date;
  seat?: string;
  eventTitle?: string;
  ticketId?: string;
  details?: string;
}

interface RecentScanItem {
  id: string;
  ticketId: string;
  customerName: string;
  seat: string;
  status: 'success' | 'warning' | 'error';
  time: string;
}

export default function PortariaPage() {
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [stats, setStats] = useState({ validatedCount: 0, totalCapacity: 0 });
  const [recentScans, setRecentScans] = useState<RecentScanItem[]>([]);
  const [autoDismissRemaining, setAutoDismissRemaining] = useState(100);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isScanningRef = useRef(false);
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dismissProgressRef = useRef<NodeJS.Timeout | null>(null);

  // Audio synthesizer via Web Audio API for instantaneous auditory feedback
  const playAudioFeedback = useCallback((status: 'success' | 'warning' | 'error') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (status === 'success') {
        // High dual chime (880Hz -> 1320Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (status === 'warning') {
        // Cautionary descending tone (520Hz -> 390Hz)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(390, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // Dual error buzz (220Hz sawtooth)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio context might be restricted before initial interaction
    }
  }, []);

  // Fetch events list
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
        const res = await fetch(`${apiUrl}/events`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
          if (data.length > 0) {
            setSelectedEventId(data[0].id);
            setStats({
              validatedCount: 0,
              totalCapacity: data[0].seats?.length || data[0].capacity || 300
            });
          }
        }
      } catch (e) {}
    };
    fetchEvents();
  }, []);

  // Update capacity stat when event selection changes
  useEffect(() => {
    const ev = events.find(e => e.id === selectedEventId);
    if (ev) {
      setStats(prev => ({
        ...prev,
        totalCapacity: ev.seats?.length || ev.capacity || 300
      }));
    }
  }, [selectedEventId, events]);

  const closeModal = useCallback(() => {
    if (autoDismissTimerRef.current) clearInterval(autoDismissTimerRef.current);
    if (dismissProgressRef.current) clearInterval(dismissProgressRef.current);
    setResult(null);
    setManualCode("");
    setAutoDismissRemaining(100);
    isScanningRef.current = false;
  }, []);

  // 3-second auto-dismiss countdown with pause support
  useEffect(() => {
    if (!result) return;

    setAutoDismissRemaining(100);
    const totalDuration = 3000;
    const intervalTime = 30;
    const step = (intervalTime / totalDuration) * 100;

    dismissProgressRef.current = setInterval(() => {
      if (!isTimerPaused) {
        setAutoDismissRemaining(prev => {
          if (prev <= 0) {
            closeModal();
            return 0;
          }
          return Math.max(0, prev - step);
        });
      }
    }, intervalTime);

    return () => {
      if (dismissProgressRef.current) clearInterval(dismissProgressRef.current);
    };
  }, [result, isTimerPaused, closeModal]);

  // Keyboard accessibility & instant dismissal (Escape, Enter, Space)
  useEffect(() => {
    if (!result) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [result, closeModal]);

  const addRecentScan = useCallback((item: RecentScanItem) => {
    setRecentScans(prev => [item, ...prev.slice(0, 4)]);
  }, []);

  const validateCode = useCallback(async (code: string) => {
    if (!selectedEventId) {
      alert("Por favor, selecione um evento primeiro!");
      return;
    }
    
    isScanningRef.current = true;
    setLoading(true);
    setResult(null);

    const cleanCode = code.trim().replace(/^#+/, '');
    const currentEvent = events.find(ev => ev.id === selectedEventId);
    const fallbackEventTitle = currentEvent ? currentEvent.title : 'Evento';

    let qrGuestName: string | undefined;
    let qrTicketId: string | undefined;
    try {
      if (cleanCode.includes('.')) {
        const parts = cleanCode.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          if (payload) {
            qrGuestName = payload.customerName || payload.guestName || payload.name || payload.userName;
            qrTicketId = payload.reservationId || payload.id;
          }
        }
      }
    } catch (e) {}

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
      
      const res = await fetch(`${apiUrl}/checkout/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ qrCode: cleanCode, eventId: selectedEventId })
      });
      const data = await res.json();
      
      const resolvedCustomerName = data.customerName || data.guestName || data.name || data.userName || qrGuestName || 'Titular do Ingresso';
      const resolvedTicketId = data.ticketId || qrTicketId || cleanCode;
      const formattedTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      if (!res.ok) {
        if (data.error && data.error.includes('JÁ UTILIZADO')) {
           const seatVal = data.seat || (data.details?.startsWith('Assento:') ? data.details.replace('Assento:', '').trim() : data.details);
           const scanRes: ValidationResult = { 
             status: 'warning', 
             title: 'Check-in Já Realizado', 
             customerName: resolvedCustomerName,
             scannedAt: data.scannedAt,
             seat: seatVal,
             eventTitle: data.eventTitle || fallbackEventTitle,
             ticketId: resolvedTicketId,
             details: 'Este ingresso já realizou o check-in na portaria. Entrada duplicada proibida.' 
           };
           setResult(scanRes);
           playAudioFeedback('warning');
           addRecentScan({
             id: Math.random().toString(),
             ticketId: resolvedTicketId,
             customerName: resolvedCustomerName,
             seat: seatVal || 'Livre',
             status: 'warning',
             time: formattedTime
           });
        } else if (data.error && data.error.includes('Evento errado')) {
           const scanRes: ValidationResult = { 
             status: 'error', 
             title: 'Evento Não Correspondente', 
             eventTitle: fallbackEventTitle,
             details: 'Este ingresso pertence a outro evento ou sessão diferente da selecionada.' 
           };
           setResult(scanRes);
           playAudioFeedback('error');
           addRecentScan({
             id: Math.random().toString(),
             ticketId: resolvedTicketId,
             customerName: resolvedCustomerName,
             seat: '-',
             status: 'error',
             time: formattedTime
           });
        } else {
           const scanRes: ValidationResult = { 
             status: 'error', 
             title: 'Ingresso Inválido', 
             eventTitle: fallbackEventTitle,
             details: data.error || 'Código ou QR Code não reconhecido no sistema.' 
           };
           setResult(scanRes);
           playAudioFeedback('error');
           addRecentScan({
             id: Math.random().toString(),
             ticketId: resolvedTicketId,
             customerName: resolvedCustomerName,
             seat: '-',
             status: 'error',
             time: formattedTime
           });
        }
      } else {
        const seatVal = data.seat || (data.details?.startsWith('Assento:') ? data.details.replace('Assento:', '').trim() : data.details);
        const scanRes: ValidationResult = { 
          status: 'success', 
          title: 'Acesso Liberado!', 
          customerName: resolvedCustomerName,
          scannedAt: data.scannedAt || new Date().toISOString(),
          seat: seatVal,
          eventTitle: data.eventTitle || fallbackEventTitle,
          ticketId: resolvedTicketId,
          details: ''
        };
        setResult(scanRes);
        playAudioFeedback('success');
        setStats(prev => ({ ...prev, validatedCount: prev.validatedCount + 1 }));
        addRecentScan({
          id: Math.random().toString(),
          ticketId: resolvedTicketId,
          customerName: resolvedCustomerName,
          seat: seatVal || 'Livre',
          status: 'success',
          time: formattedTime
        });
      }
    } catch (err) {
      setResult({ 
        status: 'error', 
        title: 'Erro de Conexão', 
        eventTitle: fallbackEventTitle,
        details: 'Não foi possível se comunicar com o servidor. Verifique a rede.' 
      });
      playAudioFeedback('error');
    }
    
    setLoading(false);
  }, [selectedEventId, events, playAudioFeedback, addRecentScan]);

  // Scanner initialization
  useEffect(() => {
    if (!selectedEventId || activeTab !== 'camera') return;

    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 15, 
          qrbox: { width: 260, height: 260 }, 
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] 
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          if (!isScanningRef.current) {
            validateCode(decodedText);
          }
        },
        () => {}
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [selectedEventId, activeTab, validateCode]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      validateCode(manualCode.trim());
    }
  };

  const formatScannedTime = (dateVal?: string | Date) => {
    if (!dateVal) return { time: new Date().toLocaleTimeString('pt-BR'), date: new Date().toLocaleDateString('pt-BR') };
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return { time: String(dateVal), date: '' };
    return {
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: d.toLocaleDateString('pt-BR')
    };
  };

  const checkinPercentage = stats.totalCapacity > 0 
    ? Math.min(100, Math.round((stats.validatedCount / stats.totalCapacity) * 100))
    : 0;

  return (
    <main className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem', maxWidth: '680px' }}>
      
      {/* HEADER TÁTICO & INDICADOR DE OPERAÇÃO */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.35rem 0.85rem', 
          background: 'rgba(37, 99, 235, 0.12)', 
          border: '1px solid rgba(37, 99, 235, 0.3)', 
          borderRadius: '9999px',
          fontFamily: 'var(--font-heading-family)',
          fontSize: '0.8rem',
          color: 'var(--accent-neon)',
          fontWeight: '600',
          letterSpacing: '0.04em',
          marginBottom: '0.75rem'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
          POSTO DE VALIDAÇÃO AO VIVO
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
          Controle de Portaria
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Validação instantânea de ingressos e QR codes em tempo real.
        </p>
      </div>

      {/* SELEÇÃO DO EVENTO */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.8rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.06em', 
          color: 'var(--text-secondary)', 
          fontWeight: '700',
          marginBottom: '0.5rem' 
        }}>
          Evento em Operação:
        </label>
        <select 
          value={selectedEventId} 
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="btn btn-secondary"
          style={{ 
            width: '100%', 
            cursor: 'pointer',
            padding: '0.85rem 1.25rem',
            paddingRight: '2.5rem',
            textAlign: 'left',
            fontWeight: '600',
            fontSize: '0.95rem',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px'
          }}
        >
          <option value="" disabled style={{ background: '#0f172a', color: 'white' }}>Selecione um evento...</option>
          {events.map(ev => (
            <option key={ev.id} value={ev.id} style={{ background: '#0f172a', color: 'white' }}>
              {ev.title} — {new Date(ev.date).toLocaleDateString('pt-BR')} ({ev.location})
            </option>
          ))}
        </select>
      </div>

      {/* LIVE THROUGHPUT HUD: MÉTRICAS DE ENTRADA */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
              Acessos Validados
            </span>
            <span style={{ fontFamily: 'var(--font-heading-family)', fontSize: '1.75rem', fontWeight: '800', color: '#10b981' }}>
              {stats.validatedCount} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>/ {stats.totalCapacity}</span>
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
              Taxa de Ocupação
            </span>
            <div style={{ fontFamily: 'var(--font-heading-family)', fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-neon)' }}>
              {checkinPercentage}%
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: '100%',
            transform: `scaleX(${checkinPercentage / 100})`,
            transformOrigin: 'left',
            background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)', 
            borderRadius: '9999px',
            transition: 'transform 0.4s ease'
          }} />
        </div>
      </div>

      {/* TABS: CÂMERA vs DIGITAÇÃO MANUAL */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('camera')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'camera' ? '1px solid var(--accent-neon)' : '1px solid var(--border-glass)',
            background: activeTab === 'camera' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.03)',
            color: activeTab === 'camera' ? 'white' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'camera' ? '0 0 15px rgba(37, 99, 235, 0.3)' : 'none'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Scanner Câmera
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: activeTab === 'manual' ? '1px solid var(--accent-neon)' : '1px solid var(--border-glass)',
            background: activeTab === 'manual' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.03)',
            color: activeTab === 'manual' ? 'white' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'manual' ? '0 0 15px rgba(37, 99, 235, 0.3)' : 'none'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="M7 8h10"></path>
            <path d="M7 12h10"></path>
            <path d="M7 16h6"></path>
          </svg>
          Digitação Manual
        </button>
      </div>

      {/* ÁREA DE LEITURA / SCANNER */}
      <div className="glass-panel" style={{ padding: '1.75rem 1.5rem', marginBottom: '1.5rem' }}>
        {activeTab === 'camera' ? (
          <div>
            {!selectedEventId ? (
              <p style={{ textAlign: 'center', color: 'var(--danger)', padding: '2rem 0' }}>
                Selecione um evento acima para inicializar a câmera.
              </p>
            ) : (
              <div style={{ position: 'relative', width: '100%', maxWidth: '380px', margin: '0 auto' }}>
                {/* Tactical HUD Frame & Guide Crosshairs */}
                <div style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '2px solid rgba(37, 99, 235, 0.5)',
                  boxShadow: '0 0 20px rgba(37, 99, 235, 0.2)',
                  background: '#000'
                }}>
                  <div id="qr-reader" style={{ width: '100%', border: 'none' }} />
                </div>
                <p style={{ 
                  textAlign: 'center', 
                  fontSize: '0.8rem', 
                  color: 'var(--text-secondary)', 
                  marginTop: '0.75rem',
                  fontFamily: 'var(--font-mono)' 
                }}>
                  Aponte a câmera para o QR Code do ingresso
                </p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleManualSubmit}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.85rem', 
              color: 'var(--text-secondary)', 
              fontWeight: '600', 
              marginBottom: '0.75rem' 
            }}>
              Código Identificador do Ingresso (ID curto ou UUID):
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input 
                type="text" 
                placeholder="Ex: #TK-8821 ou Código do Ingresso" 
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '0.85rem 1.25rem', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-glass)', 
                  background: 'rgba(0, 0, 0, 0.3)', 
                  color: 'var(--text-primary)', 
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem'
                }}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || !selectedEventId || !manualCode.trim()}
                style={{ borderRadius: '12px', padding: '0.85rem 1.75rem' }}
              >
                {loading ? 'Validando...' : 'Validar'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* FEED DE LEITURAS RECENTES */}
      {recentScans.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <h3 style={{ 
            fontSize: '0.9rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.06em', 
            color: 'var(--text-secondary)', 
            marginBottom: '0.75rem' 
          }}>
            Leituras Recentes neste Posto
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentScans.map((scan) => (
              <div 
                key={scan.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: `1px solid ${
                    scan.status === 'success' ? 'rgba(16, 185, 129, 0.25)' : scan.status === 'warning' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(239, 68, 68, 0.25)'
                  }`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    background: scan.status === 'success' ? 'rgba(16, 185, 129, 0.2)' : scan.status === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: scan.status === 'success' ? '#10b981' : scan.status === 'warning' ? '#f59e0b' : '#ef4444'
                  }}>
                    {scan.status === 'success' ? 'Liberado' : scan.status === 'warning' ? 'Duplicado' : 'Inválido'}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>{scan.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      Assento: {scan.seat} • #{scan.ticketId.replace(/^#+/, '').substring(0, 6).toUpperCase()}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {scan.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL EXPANDIDO DE ALTA VISIBILIDADE / RESULTADO COM AUTO-DISMISS */}
      {result && (
        <div 
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          onMouseEnter={() => setIsTimerPaused(true)}
          onMouseLeave={() => setIsTimerPaused(false)}
          onTouchStart={() => setIsTimerPaused(true)}
          onTouchEnd={() => setIsTimerPaused(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 15, 30, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '620px',
              padding: '2.5rem 2rem 2rem 2rem',
              borderRadius: '24px',
              textAlign: 'center',
              position: 'relative',
              boxShadow: result.status === 'success' 
                ? '0 0 60px rgba(16, 185, 129, 0.4), 0 25px 50px rgba(0,0,0,0.8)' 
                : result.status === 'warning' 
                ? '0 0 60px rgba(245, 158, 11, 0.4), 0 25px 50px rgba(0,0,0,0.8)' 
                : '0 0 60px rgba(239, 68, 68, 0.4), 0 25px 50px rgba(0,0,0,0.8)',
              border: `2px solid ${
                result.status === 'success' ? '#10b981' : result.status === 'warning' ? '#f59e0b' : '#ef4444'
              }`,
              background: result.status === 'success'
                ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.18) 0%, rgba(15, 23, 42, 0.96) 100%)'
                : result.status === 'warning'
                ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.18) 0%, rgba(15, 23, 42, 0.96) 100%)'
                : 'linear-gradient(180deg, rgba(239, 68, 68, 0.18) 0%, rgba(15, 23, 42, 0.96) 100%)'
            }}
          >
            {/* Auto-Dismiss Countdown Progress Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              borderTopLeftRadius: '22px',
              borderTopRightRadius: '22px',
              background: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: '100%',
                transform: `scaleX(${autoDismissRemaining / 100})`,
                transformOrigin: 'left',
                background: result.status === 'success' ? '#10b981' : result.status === 'warning' ? '#f59e0b' : '#ef4444',
                transition: 'transform 30ms linear'
              }} />
            </div>

            {/* Botão Fechar no Canto Superior */}
            <button 
              onClick={closeModal}
              title="Fechar (Esc ou Espaço)"
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              &times;
            </button>

            {/* Ícone Gigante de Status */}
            <div style={{
              width: '84px',
              height: '84px',
              margin: '0 auto 1.25rem auto',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: result.status === 'success' 
                ? 'rgba(16, 185, 129, 0.2)' 
                : result.status === 'warning' 
                ? 'rgba(245, 158, 11, 0.2)' 
                : 'rgba(239, 68, 68, 0.2)',
              border: `2px solid ${
                result.status === 'success' ? '#10b981' : result.status === 'warning' ? '#f59e0b' : '#ef4444'
              }`,
              boxShadow: `0 0 30px ${
                result.status === 'success' ? 'rgba(16, 185, 129, 0.5)' : result.status === 'warning' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(239, 68, 68, 0.5)'
              }`
            }}>
              {result.status === 'success' && (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
              {result.status === 'warning' && (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              )}
              {result.status === 'error' && (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              )}
            </div>

            {/* Título de Status */}
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '800', 
              letterSpacing: '-0.02em',
              marginBottom: '1.25rem',
              color: result.status === 'success' ? '#10b981' : result.status === 'warning' ? '#f59e0b' : '#ef4444' 
            }}>
              {result.title}
            </h2>

            {/* Grid de Informações com Nome do Cliente, Horário, Assento e Evento */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              margin: '1.25rem 0',
              textAlign: 'left'
            }}>
              {/* Nome do Cliente */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Cliente / Titular
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', wordBreak: 'break-word' }}>
                  {result.customerName || 'Titular do Ingresso'}
                </div>
              </div>

              {/* Horário da Liberação */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  {result.status === 'warning' ? 'Liberado Anteriormente às' : 'Hora da Liberação'}
                </div>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  fontFamily: 'var(--font-mono)',
                  color: result.status === 'success' ? '#34d399' : result.status === 'warning' ? '#fbbf24' : 'white' 
                }}>
                  {formatScannedTime(result.scannedAt).time}
                </div>
                {formatScannedTime(result.scannedAt).date && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {formatScannedTime(result.scannedAt).date}
                  </div>
                )}
              </div>

              {/* Evento & Ticket ID */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Evento / Código
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', wordBreak: 'break-word' }}>
                  {result.eventTitle || 'Evento'}
                </div>
                {result.ticketId && (
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    #{result.ticketId.replace(/^#+/, '').substring(0, 8).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Assento */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Assento Reservado
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'white' }}>
                  {result.seat || 'Livre / Pista'}
                </div>
              </div>
            </div>

            {/* Detalhes / Alerta de Erro ou Advertência */}
            {result.details && (
              <div style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                fontSize: '0.95rem',
                background: result.status === 'success' 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : result.status === 'warning' 
                  ? 'rgba(245, 158, 11, 0.15)' 
                  : 'rgba(239, 68, 68, 0.15)',
                color: result.status === 'success' 
                  ? '#a7f3d0' 
                  : result.status === 'warning' 
                  ? '#fde68a' 
                  : '#fca5a5',
                border: `1px solid ${
                  result.status === 'success' ? 'rgba(16, 185, 129, 0.3)' : result.status === 'warning' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'
                }`
              }}>
                {result.details}
              </div>
            )}

            {/* Botão de Ação Rápida */}
            <button 
              className="btn btn-primary" 
              onClick={closeModal}
              autoFocus
              style={{ 
                width: '100%', 
                padding: '0.95rem', 
                fontSize: '1.1rem', 
                fontWeight: '700',
                borderRadius: '14px',
                background: result.status === 'success' 
                  ? '#10b981' 
                  : result.status === 'warning' 
                  ? '#d97706' 
                  : '#dc2626',
                boxShadow: `0 4px 20px ${
                  result.status === 'success' ? 'rgba(16, 185, 129, 0.4)' : result.status === 'warning' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'
                }`
              }}
            >
              Escanear Próximo (Espaço / Enter)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
