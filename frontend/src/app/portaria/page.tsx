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

export default function PortariaPage() {
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    // Buscar eventos para popular o select
    const fetchEvents = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
        const res = await fetch(`${apiUrl}/events`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
          if (data.length > 0) setSelectedEventId(data[0].id);
        }
      } catch (e) {}
    };
    fetchEvents();
  }, []);

  const closeModal = useCallback(() => {
    setResult(null);
    setManualCode("");
    isScanningRef.current = false;
  }, []);

  // Atalhos de teclado para fechar o modal rapidamente na portaria
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

  useEffect(() => {
    // Inicializar o scanner apenas quando houver um evento selecionado e montado
    if (!selectedEventId) return;

    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          // Evitar scan duplo enquanto carrega ou modal está aberto
          if (!isScanningRef.current) {
            validateCode(decodedText);
          }
        },
        () => {
          // ignore background scan errors
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.log('Erro ao limpar scanner', e));
        scannerRef.current = null;
      }
    };
  }, [selectedEventId]);

  const validateCode = async (code: string) => {
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

      if (!res.ok) {
        if (data.error && data.error.includes('JÁ UTILIZADO')) {
           const seatVal = data.seat || (data.details?.startsWith('Assento:') ? data.details.replace('Assento:', '').trim() : data.details);
           setResult({ 
             status: 'warning', 
             title: 'Check-in Já Realizado', 
             customerName: resolvedCustomerName,
             scannedAt: data.scannedAt,
             seat: seatVal,
             eventTitle: data.eventTitle || fallbackEventTitle,
             ticketId: resolvedTicketId,
             details: 'Este ingresso já realizou o check-in na portaria. Entrada duplicada proibida.' 
           });
        } else if (data.error && data.error.includes('Evento errado')) {
           setResult({ 
             status: 'error', 
             title: 'Evento Não Correspondente', 
             eventTitle: fallbackEventTitle,
             details: 'Este ingresso pertence a outro evento ou sessão diferente da selecionada.' 
           });
        } else {
           setResult({ 
             status: 'error', 
             title: 'Ingresso Inválido', 
             eventTitle: fallbackEventTitle,
             details: data.error || 'Código ou QR Code não reconhecido no sistema.' 
           });
        }
      } else {
        const seatVal = data.seat || (data.details?.startsWith('Assento:') ? data.details.replace('Assento:', '').trim() : data.details);
        setResult({ 
          status: 'success', 
          title: 'Acesso Liberado!', 
          customerName: resolvedCustomerName,
          scannedAt: data.scannedAt || new Date().toISOString(),
          seat: seatVal,
          eventTitle: data.eventTitle || fallbackEventTitle,
          ticketId: resolvedTicketId,
          details: ''
        });
      }
    } catch (err) {
      setResult({ 
        status: 'error', 
        title: 'Erro de Conexão', 
        eventTitle: fallbackEventTitle,
        details: 'Não foi possível se comunicar com o servidor. Verifique a rede.' 
      });
    }
    
    setLoading(false);
  };

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

  return (
    <main className="container" style={{ padding: '4rem 1.5rem', maxWidth: '640px' }}>
      <h1 className="neon-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>Controle de Portaria</h1>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Selecione o Evento Atual:</label>
          <select 
            value={selectedEventId} 
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="btn btn-secondary"
            style={{ 
              width: '100%', 
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              paddingRight: '2.5rem',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f8fafc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1.5rem center',
              backgroundSize: '1em',
              textAlign: 'left',
              justifyContent: 'flex-start'
            }}
          >
            <option value="" disabled style={{ background: '#0f172a', color: 'white' }}>Selecione um evento...</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id} style={{ background: '#0f172a', color: 'white' }}>{ev.title} - {new Date(ev.date).toLocaleDateString('pt-BR')}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Leitura por Câmera</h3>
          {!selectedEventId && <p style={{ textAlign: 'center', color: 'var(--danger)' }}>Selecione o evento acima para ligar a câmera.</p>}
          <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', background: 'white', borderRadius: '12px', overflow: 'hidden' }}></div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>OU</div>

        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Digite o código manualmente (ID)" 
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '0.75rem 1.5rem', 
              borderRadius: '9999px', 
              border: '1px solid var(--border-glass)', 
              background: 'rgba(0, 0, 0, 0.2)', 
              color: 'var(--text-primary)', 
              outline: 'none' 
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !selectedEventId}>
            {loading ? 'Validando...' : 'Validar'}
          </button>
        </form>
      </div>

      {/* MODAL EXPANDIDO DE ALTA VISIBILIDADE / RESULTADO DA VALIDAÇÃO */}
      {result && (
        <div 
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 15, 30, 0.85)',
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
              padding: '2.5rem 2rem',
              borderRadius: '24px',
              textAlign: 'center',
              position: 'relative',
              boxShadow: result.status === 'success' 
                ? '0 0 50px rgba(16, 185, 129, 0.35), 0 25px 50px rgba(0,0,0,0.8)' 
                : result.status === 'warning' 
                ? '0 0 50px rgba(245, 158, 11, 0.35), 0 25px 50px rgba(0,0,0,0.8)' 
                : '0 0 50px rgba(239, 68, 68, 0.35), 0 25px 50px rgba(0,0,0,0.8)',
              border: `2px solid ${
                result.status === 'success' ? '#10b981' : result.status === 'warning' ? '#f59e0b' : '#ef4444'
              }`,
              background: result.status === 'success'
                ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)'
                : result.status === 'warning'
                ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)'
                : 'linear-gradient(180deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)'
            }}
          >
            {/* Botão Fechar no Canto Superior */}
            <button 
              onClick={closeModal}
              title="Fechar"
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
              margin: '0 auto 1.5rem auto',
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
              boxShadow: `0 0 25px ${
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
              margin: '1.5rem 0',
              textAlign: 'left'
            }}>
              {/* Nome do Cliente (Nome e Sobrenome) */}
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
                <div style={{ fontSize: '1.15rem', fontWeight: '600', color: 'white', wordBreak: 'break-word' }}>
                  {result.eventTitle || 'Evento'}
                </div>
                {result.ticketId && (
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
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
                padding: '0.9rem 1.25rem',
                borderRadius: '12px',
                marginBottom: '1.75rem',
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
                padding: '1rem', 
                fontSize: '1.15rem', 
                fontWeight: '700',
                borderRadius: '14px',
                background: result.status === 'success' 
                  ? 'var(--accent-neon)' 
                  : result.status === 'warning' 
                  ? '#d97706' 
                  : '#dc2626'
              }}
            >
              Escanear Próximo
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

