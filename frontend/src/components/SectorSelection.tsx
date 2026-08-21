'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutService } from '@/services/CheckoutService';
import styles from './SectorSelection.module.css';

type Seat = {
  id: string;
  row: string;
  number: number;
  status: string;
};

type SectorSelectionProps = {
  seats: Seat[];
  eventId: string;
  basePrice: number;
  maxTickets: number;
  feeRate: number;
};

export default function SectorSelection({ seats, eventId, basePrice, maxTickets, feeRate }: SectorSelectionProps) {
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
    if (!localStorage.getItem('token')) {
      if (confirm('Você precisa fazer login para reservar ingressos. Deseja entrar agora?')) {
        router.push('/login');
      }
      return;
    }

    const availableSeats = sectors[sectorName]?.available;
    if (!availableSeats || availableSeats.length === 0) {
      alert('Setor esgotado!');
      return;
    }

    // Pega o primeiro ingresso disponível do lote
    const seatToReserve = availableSeats[0];

    setLoading(true);
    try {
      const reservation = await CheckoutService.reserve(eventId, seatToReserve.id);
      
      // Direciona para a página de pagamento com o ID da reserva
      router.push(`/pagamento/${reservation.id}`);
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
        const serviceFee = price * feeRate;
        const isSoldOut = data.available.length === 0;

        return (
          <div key={sectorName} className={`${styles.sectorCard} ${isCamarote ? styles.vip : ''} ${isSoldOut ? styles.soldOut : ''}`}>
            <div className={styles.sectorInfo}>
              <h3>Lote {sectorName} {isCamarote && '⭐'}</h3>
              <p className={styles.availability}>
                {isSoldOut ? 'Esgotado' : `Permitido até ${maxTickets} ingressos por pessoa`}
              </p>
            </div>
            
            <div className={styles.actionArea}>
              <div className={styles.price}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  <span>Taxa de Serviço ({Math.round(feeRate * 100)}%)</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(serviceFee)}</span>
                </div>
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
