'use client';
import { useState } from "react";
import Header from "@/components/Header";
import QRScanner from "@/components/QRScanner";

export default function PortariaPage() {
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<{ status: 'success' | 'error' | 'warning', message: string, details?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const validateCode = async (code: string) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: code })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error.includes('JÁ UTILIZADO')) {
           setResult({ status: 'warning', message: 'Já Utilizado', details: 'Este ingresso já deu entrada no evento.' });
        } else {
           setResult({ status: 'error', message: 'Inválido', details: 'QR Code não reconhecido no sistema.' });
        }
      } else {
        setResult({ status: 'success', message: 'Acesso Liberado!', details: data.details });
      }
    } catch (err) {
      setResult({ status: 'error', message: 'Erro de Conexão' });
    }
    setLoading(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) validateCode(manualCode);
  };

  return (
    <main>
      <Header />
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '600px' }}>
        <h1 className="neon-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>Controle de Portaria</h1>
        
        <div className="glass-panel" style={{ padding: '2rem' }}>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Leitura por Câmera</h3>
            <QRScanner onScan={validateCode} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>OU</div>

          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Digite o código manualmente..." 
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.5)', color: 'white' }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>Validar</button>
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
                Escanear Próximo
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
