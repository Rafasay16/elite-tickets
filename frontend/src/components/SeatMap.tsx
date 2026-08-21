'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutService } from '@/services/CheckoutService';
import styles from './SeatMap.module.css';

type Seat = {
  id: string;
  row: string;
  number: number;
  status: string;
};

interface SeatMapProps {
  seatsByRow: Record<string, Seat[]>;
  eventId: string;
  price: number;
  feeRate: number;
}

export default function SeatMap({ seatsByRow, eventId, price, feeRate }: SeatMapProps) {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelect = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return;
    
    if (!localStorage.getItem('token')) {
      if (confirm('Você precisa fazer login para reservar ingressos. Deseja entrar agora?')) {
        router.push('/login');
      }
      return;
    }

    setSelectedSeat(seat);
  };

  const handleCheckout = async () => {
    if (!selectedSeat) return;
    setLoading(true);
    const subtotal = price;
    const serviceFee = subtotal * feeRate;
    const total = subtotal + serviceFee;
    try {
      const reservation = await CheckoutService.reserve(eventId, selectedSeat.id);
      router.push(`/pagamento/${reservation.id}`);
      setSelectedSeat(null);
      
      // Ir para tela de pagamento
      router.push(`/pagamento/${reservation.id}`);
    } catch (err: any) {
      alert(`Erro ao reservar: ${err.message}`);
      setLoading(false);
    }
  };

  const serviceFee = price * feeRate;
  const total = price + serviceFee;

  return (
    <div className={styles.container}>
      <div className={styles.screenContainer}>
        <div className={styles.screen}></div>
        <div className={styles.screenGlow}></div>
        <p className={styles.screenText}>TELA</p>
      </div>
      
      <div className={styles.map}>
        {Object.entries(seatsByRow).map(([row, seats]) => (
          <div key={row} className={styles.row}>
            <span className={styles.rowLabel}>{row}</span>
            <div className={styles.seats}>
              {seats.map((seat) => (
                <button
                  key={seat.id}
                  className={`${styles.seat} ${styles[seat.status.toLowerCase()]} ${selectedSeat?.id === seat.id ? styles.selected : ''}`}
                  onClick={() => handleSelect(seat)}
                  disabled={seat.status !== 'AVAILABLE'}
                  title={`Fila ${row}, Assento ${seat.number}`}
                >
                  {seat.number}
                </button>
              ))}
            </div>
            <span className={styles.rowLabel}>{row}</span>
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}><div className={`${styles.seat} ${styles.available}`}></div> Disponível</div>
        <div className={styles.legendItem}><div className={`${styles.seat} ${styles.selected}`}></div> Selecionado</div>
        <div className={styles.legendItem}><div className={`${styles.seat} ${styles.sold}`}></div> Indisponível</div>
      </div>

      {selectedSeat && (
        <div className={styles.checkoutBar}>
          <div className={styles.checkoutInfo}>
            <h3>Assento: <span className="neon-text">{selectedSeat.row}{selectedSeat.number}</span></h3>
            <p className={styles.totalPrice}>Subtotal: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
              <span>Taxa de Serviço ({Math.round(feeRate * 100)}%)</span>
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(serviceFee)}</span>
            </div>
            <p className="neon-text" style={{ fontWeight: 'bold', marginTop: '0.5rem', fontSize: '1.2rem' }}>
              Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </p>
          </div>
          <button className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`} onClick={handleCheckout} disabled={loading}>
            {loading ? 'Processando...' : 'Confirmar e Pagar (Simulado)'}
          </button>
        </div>
      )}
    </div>
  );
}
