'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SectorSelection.module.css';

type Seat = {
  id: string;
  row: string;
  number: number;
  status: string;
};

export default function SectorSelection({ seats, eventId, basePrice }: { seats: Seat[], eventId: string, basePrice: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Agrupa os assentos por setor
  const sectors = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = { available: [], sold: 0 };
    }
    if (seat.status === 'AVAILABLE') {
      acc[seat.row].available.push(seat);
    } else {
      acc[seat.row].sold++;
    }
    return acc;
  }, {} as Record<string, { available: Seat[], sold: number }>);

  const handleCheckout = async (sectorName: string) => {
    const availableSeats = sectors[sectorName]?.available;
    if (!availableSeats || availableSeats.length === 0) {
      alert('Setor esgotado!');
      return;
    }

    // Pega o primeiro ingresso disponível do lote
    const seatToReserve = availableSeats[0];

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, seatId: seatToReserve.id }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      router.push('/meus-ingressos?sucesso=true');
    } catch (err: any) {
      alert(`Erro ao reservar: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {Object.entries(sectors).map(([sectorName, data]) => {
        const isCamarote = sectorName.toUpperCase() === 'CAMAROTE';
        const price = isCamarote ? basePrice * 2 : basePrice;
        const total = data.available.length + data.sold;
        const isSoldOut = data.available.length === 0;

        return (
          <div key={sectorName} className={`${styles.sectorCard} ${isCamarote ? styles.vip : ''} ${isSoldOut ? styles.soldOut : ''}`}>
            <div className={styles.sectorInfo}>
              <h3>Lote {sectorName} {isCamarote && '⭐'}</h3>
              <p className={styles.availability}>
                {isSoldOut ? 'Esgotado' : `${data.available.length} ingressos disponíveis`} de {total}
              </p>
            </div>
            
            <div className={styles.actionArea}>
              <div className={styles.price}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
              </div>
              <button 
                className={`btn btn-primary ${loading || isSoldOut ? 'btn-disabled' : ''}`}
                onClick={() => handleCheckout(sectorName)}
                disabled={loading || isSoldOut}
              >
                {loading ? 'Processando...' : (isSoldOut ? 'Esgotado' : 'Comprar')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
