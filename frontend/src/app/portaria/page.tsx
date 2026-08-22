'use client';
import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

export default function PortariaPage() {
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<{ status: 'success' | 'error' | 'warning', message: string, details?: string } | null>(null);
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
          // Evitar scan duplo enquanto carrega
          if (!isScanningRef.current) {
            validateCode(decodedText);
          }
        },
        (error) => {
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
  }, [selectedEventId]); // Re-render scanner if event changes (or just keep it alive)

  const validateCode = async (code: string) => {
    if (!selectedEventId) {
      alert("Por favor, selecione um evento primeiro!");
      return;
    }
    
    isScanningRef.current = true;
    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
      
      const res = await fetch(`${apiUrl}/checkout/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ qrCode: code, eventId: selectedEventId })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error.includes('JÁ UTILIZADO')) {
           setResult({ status: 'warning', message: 'Já Utilizado', details: 'Este ingresso já deu entrada no evento.' });
        } else if (data.error.includes('Evento errado')) {
           setResult({ status: 'error', message: 'Evento Errado', details: 'Este ingresso pertence a outro evento.' });
        } else {
           setResult({ status: 'error', message: 'Inválido', details: data.error || 'QR Code não reconhecido no sistema.' });
        }
      } else {
        setResult({ status: 'success', message: 'Acesso Liberado!', details: data.details });
      }
    } catch (err) {
      setResult({ status: 'error', message: 'Erro de Conexão' });
    }
    
    setLoading(false);
    
    // Pequeno delay para evitar leitura múltipla acidental
    setTimeout(() => {
      isScanningRef.current = false;
    }, 2000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) {
      validateCode(manualCode);
      setManualCode(""); // Limpar apos submeter
    }
  };

  return (
    <main className="container" style={{ padding: '4rem 1.5rem', maxWidth: '600px' }}>
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
          <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', background: 'white' }}></div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>OU</div>

        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Digite o código manualmente (ID)" 
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            style={{ flex: 1, padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !selectedEventId}>Validar</button>
        </form>

        {loading && <p style={{ textAlign: 'center', marginTop: '1rem' }}>Validando...</p>}

        {result && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            background: result.status === 'success' ? 'rgba(52, 211, 153, 0.2)' : result.status === 'warning' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            border: `1px solid ${result.status === 'success' ? 'var(--success)' : result.status === 'warning' ? '#fbbf24' : 'var(--danger)'}`
          }}>
            <h2 style={{ color: result.status === 'success' ? 'var(--success)' : result.status === 'warning' ? '#fbbf24' : 'var(--danger)' }}>
              {result.message}
            </h2>
            {result.details && <p style={{ marginTop: '0.5rem', color: 'var(--text-primary)' }}>{result.details}</p>}
            
            <button 
              className="btn btn-secondary" 
              style={{ marginTop: '1rem' }} 
              onClick={() => setResult(null)}
            >
              Limpar / Escanear Próximo
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
