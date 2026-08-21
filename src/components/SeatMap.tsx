'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SeatMap.module.css';

type Seat = {
  id: string;
  row: string;
  number: number;
  status: string;
};

export default function SeatMap({ seatsByRow, eventId, price }: { seatsByRow: Record<string, Seat[]>, eventId: string, price: number }) {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelect = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return;
    setSelectedSeat(seat);
  };

  const handleCheckout = async () => {
    if (!selectedSeat) return;
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, seatId: selectedSeat.id }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Limpar seleção
      setSelectedSeat(null);
      
      // Ir para tela de pagamento
      router.push(`/pagamento/${data.reservation.id}`);
    } catch (err: any) {
      alert(`Erro ao reservar: ${err.message}`);
      setLoading(false);
    }
  };

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
            <p className={styles.totalPrice}>Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}</p>
          </div>
          <button className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`} onClick={handleCheckout} disabled={loading}>
            {loading ? 'Processando...' : 'Confirmar e Pagar (Simulado)'}
          </button>
        </div>
      )}
    </div>
  );
}
