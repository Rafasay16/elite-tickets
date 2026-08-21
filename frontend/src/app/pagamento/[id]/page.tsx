'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckoutService } from '@/services/CheckoutService';
import styles from './page.module.css';

export default function PagamentoPage({ params }: { params: { id: string } }) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'pix' | 'card'>('pix');
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
      await CheckoutService.confirm(reservationId);
      router.push('/meus-ingressos?sucesso=true');
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136elite-tickets@banco.com.br5204000053039865802BR5913Elite Tickets6009Sao Paulo62070503***6304A1B2');
    alert('Código PIX copiado!');
  };

  return (
    <main className={styles.main}>
      <div className={`glass-panel ${styles.panel}`}>
        
        {/* Header Compacto com Timer */}
        <div className={styles.header}>
          <h2>Finalizar Pedido</h2>
          <div className={styles.timerBadge}>
            Tempo restante: <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          </div>
        </div>

        <div className={styles.methodSelector}>
          <button 
            className={method === 'pix' ? styles.activeMethod : ''} 
            onClick={() => setMethod('pix')}
          >
            PIX
          </button>
          <button 
            className={method === 'card' ? styles.activeMethod : ''} 
            onClick={() => setMethod('card')}
          >
            Cartão de Crédito
          </button>
        </div>

        <div className={styles.paymentArea}>
          {method === 'pix' ? (
            <div className={styles.pixArea}>
              <p className="text-secondary" style={{ marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
                Escaneie o QR Code abaixo com o aplicativo do seu banco:
              </p>
              <div className={styles.qrPlaceholder} style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', background: '#fff', padding: '1rem', borderRadius: '8px', width: 'fit-content', margin: '0 auto 1.5rem auto' }}>
                <Image src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020126580014br.gov.bcb.pix0136elite-tickets@banco.com.br5204000053039865802BR5913Elite Tickets6009Sao Paulo62070503***6304A1B2" alt="QR Code PIX" width={150} height={150} unoptimized />
              </div>
              <button className="btn btn-secondary" onClick={copyPix} style={{ width: '100%', marginBottom: '1.5rem' }}>
                Copiar PIX Copia e Cola
              </button>
            </div>
          ) : (
            <div className={styles.cardArea}>
              <div className={styles.inputGroup}>
                <label>Número do Cartão Fictício</label>
                <input type="text" placeholder="0000 0000 0000 0000" defaultValue="4111 1111 1111 1111" disabled />
              </div>
              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                <div className={styles.inputGroup}>
                  <label>Validade</label>
                  <input type="text" placeholder="MM/AA" defaultValue="12/30" disabled />
                </div>
                <div className={styles.inputGroup}>
                  <label>CVV</label>
                  <input type="text" placeholder="123" defaultValue="123" disabled />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Nome no Cartão</label>
                <input type="text" placeholder="NOME IMPRESSO" defaultValue="JOAO SILVA" disabled />
              </div>
            </div>
          )}

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1rem' }}
            onClick={handlePayment}
            disabled={loading || timeLeft <= 0}
          >
            {loading ? 'Processando...' : method === 'pix' ? 'Simular Pagamento PIX' : 'Pagar com Cartão Simulado'}
          </button>
          <p className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>
            Ambiente de demonstração. Nenhuma cobrança real será efetuada.
          </p>
        </div>
      </div>
    </main>
  );
}
