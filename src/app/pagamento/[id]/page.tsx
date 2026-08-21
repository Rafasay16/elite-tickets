'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function PagamentoPage({ params }: { params: { id: string } }) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos em segundos
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const reservationId = params.id;

  useEffect(() => {
    if (timeLeft <= 0) {
      alert('O tempo para pagamento expirou! O ingresso voltou para o estoque.');
      router.push('/');
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, router]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Sucesso
      router.push('/meus-ingressos?sucesso=true');
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={`glass-panel ${styles.panel}`}>
        <h1 className="neon-text">Finalizar Pagamento</h1>
        
        <div className={styles.timerBox}>
          <p className="text-secondary">Seu assento está reservado por:</p>
          <div className={styles.time}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        <div className={styles.simulatedCard}>
          <h3>Área de Pagamento Simulado</h3>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Esta é uma demonstração de portfólio. Não solicitamos dados reais de cartão.
          </p>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
            onClick={handlePayment}
            disabled={loading || timeLeft <= 0}
          >
            {loading ? 'Processando...' : 'Confirmar e Gerar Ingresso'}
          </button>
        </div>
      </div>
    </main>
  );
}
