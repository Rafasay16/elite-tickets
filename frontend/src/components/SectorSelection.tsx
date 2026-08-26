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
  const [loadingSector, setLoadingSector] = useState<string | null>(null);
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

    const seatToReserve = availableSeats[0];
    setLoadingSector(sectorName);

    try {
      const reservation = await CheckoutService.reserve(eventId, seatToReserve.id);
      router.push(`/pagamento/${reservation.id}`);
    } catch (err: any) {
      alert(`Erro ao reservar: ${err.message}`);
      setLoadingSector(null);
    }
  };

  return (
    <div className={styles.container}>
      {Object.entries(sectors).map(([sectorName, data]) => {
        const isCamarote = sectorName.toUpperCase().includes('CAMAROTE') || sectorName.toUpperCase().includes('VIP');
        const price = isCamarote ? basePrice * 2 : basePrice;
        const serviceFee = price * feeRate;
        const total = price + serviceFee;
        const isSoldOut = data.available.length === 0;
        const isLoading = loadingSector === sectorName;

        return (
          <div 
            key={sectorName} 
            className={`${styles.sectorCard} ${isCamarote ? styles.vip : ''} ${isSoldOut ? styles.soldOut : ''}`}
          >
            <div>
              <div className={styles.sectorHeader}>
                <h3 className={styles.sectorTitle}>
                  Setor {sectorName}
                </h3>
                {isCamarote && (
                  <span className={styles.vipBadge}>Área Nobre VIP</span>
                )}
              </div>
              <p className={styles.availability}>
                {isSoldOut ? (
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>● Esgotado</span>
                ) : (
                  <span>✓ Disponível • Permitido até {maxTickets} ingressos por CPF</span>
                )}
              </p>
            </div>
            
            <div className={styles.actionArea}>
              <div className={styles.priceBlock}>
                <div className={styles.priceValue}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                </div>
                <span className={styles.feeText}>
                  Ingresso {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)} + Taxa ({Math.round(feeRate * 100)}%)
                </span>
              </div>

              <button 
                className={`btn btn-primary ${isLoading || isSoldOut ? 'btn-disabled' : ''}`}
                onClick={() => handleCheckout(sectorName)}
                disabled={isLoading || isSoldOut}
                style={{ padding: '0.75rem 1.85rem', fontWeight: 800 }}
              >
                {isLoading ? 'Processando...' : (isSoldOut ? 'Esgotado' : 'Comprar Ingresso →')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
