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
    
    // Toggle unselect if clicking the same seat
    if (selectedSeat?.id === seat.id) {
      setSelectedSeat(null);
      return;
    }

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
    try {
      const reservation = await CheckoutService.reserve(eventId, selectedSeat.id);
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
      
      {/* Mobile Scroll Hint */}
      <div className={styles.mobileScrollHint}>
        <span>↔</span>
        <span>Arraste para os lados para explorar todas as poltronas</span>
      </div>

      {/* Cinema Screen Presentation */}
      <div className={styles.screenContainer}>
        <div className={styles.screen}></div>
        <div className={styles.screenGlow}></div>
        <div className={styles.screenMeta}>
          <span className={styles.screenText}>TELA PRINCIPAL</span>
          <span className={styles.screenBadge}>DOLBY ATMOS 4K</span>
        </div>
      </div>
      
      {/* Interactive Seat Matrix */}
      <div className={styles.map}>
        {Object.entries(seatsByRow).map(([row, seats]) => (
          <div key={row} className={styles.row}>
            <span className={styles.rowLabel}>{row}</span>
            <div className={styles.seats}>
              {seats.map((seat) => {
                const isSelected = selectedSeat?.id === seat.id;
                const statusClass = styles[seat.status.toLowerCase()] || styles.available;
                
                return (
                  <button
                    key={seat.id}
                    className={`${styles.seat} ${statusClass} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleSelect(seat)}
                    disabled={seat.status !== 'AVAILABLE'}
                    title={`Fila ${row}, Poltrona ${seat.number} (${seat.status === 'AVAILABLE' ? 'Disponível' : 'Ocupado'})`}
                    aria-label={`Fila ${row}, Poltrona ${seat.number}`}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
            <span className={styles.rowLabel}>{row}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.seat} ${styles.available}`}></div>
          <span>Disponível</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.seat} ${styles.selected}`}></div>
          <span>Selecionado</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.seat} ${styles.sold}`}></div>
          <span>Ocupado</span>
        </div>
      </div>

      {/* Floating / Sticky Checkout Summary Bar */}
      {selectedSeat && (
        <div className={styles.checkoutBar}>
          <div className={styles.checkoutDetails}>
            <div className={styles.selectedSeatBadge}>
              <span>✓ Poltrona Selecionada:</span>
              <span>Fila {selectedSeat.row}, Nº {selectedSeat.number}</span>
            </div>
            
            <div className={styles.priceBreakdown}>
              <span>Ingresso: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}</span>
              <span>•</span>
              <span>Taxa de Serviço ({Math.round(feeRate * 100)}%): {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(serviceFee)}</span>
            </div>

            <p className={styles.totalPrice}>
              Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </p>
          </div>

          <button 
            className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`} 
            onClick={handleCheckout} 
            disabled={loading}
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 800 }}
          >
            {loading ? 'Reservando...' : 'Garantir Ingresso →'}
          </button>
        </div>
      )}
    </div>
  );
}
