'use client';
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ShareButton from "@/components/ShareButton";
import { getImageUrl } from "@/lib/tmdb";
import { CalendarIcon, MapPinIcon } from "@/components/Icons";
import { CheckoutService } from "@/services/CheckoutService";
import styles from "../app/meus-ingressos/page.module.css";

export default function TicketCard({ res }: { res: any }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isExpired = new Date(res.event.date) < new Date();

  // Um identificador curto para o ingresso para o usuário saber que é único
  const shortId = res.id.split('-')[0].toUpperCase();

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este ingresso expirado?')) return;
    setLoading(true);
    try {
      await CheckoutService.deleteTicket(res.id);
      router.refresh();
    } catch (e: any) {
      alert(e.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.expiredWrapper}>
      {isExpired && (
        <div className={styles.expiredTag} onClick={handleDelete} title="Excluir ingresso">
          <span>{loading ? 'Excluindo...' : 'Expirado'}</span>
          {!loading && <div className={styles.deleteText}>Excluir</div>}
        </div>
      )}
      <div className={`glass-panel ${styles.ticket}`} style={{ opacity: isExpired ? 0.6 : 1 }}>
        <div className={styles.eventInfo}>
          <Image
            src={getImageUrl(res.event.posterUrl)}
            alt="Poster"
            width={80}
            height={120}
            className={styles.ticketPoster}
          />
          <div>
            <h3>{res.event.title}</h3>
            <p className="text-secondary" style={{ display: 'flex', alignItems: 'center' }}><MapPinIcon /> {res.event.location}</p>
            <p className="text-secondary" style={{ display: 'flex', alignItems: 'center' }}><CalendarIcon /> {new Date(res.event.date).toLocaleString('pt-BR')}</p>
            <div className={styles.seatBadge}>
              Fila {res.seat.row} - Assento {res.seat.number}
            </div>
          </div>
        </div>

        <div className={styles.qrSection}>
          <div className={styles.cutout}></div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}
            onClick={() => setShowModal(true)}
          >
            <span>Ver QR Code</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '0.2rem' }}>#{shortId}</span>
          </button>

          <ShareButton qrCode={res.id} disabled={isExpired} />
        </div>
      </div>

      {showModal && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>Ingresso para Portaria</h2>
            <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '1rem' }}>
              <Image src={res.qrDataUrl} alt="QR Code do Ingresso" width={250} height={250} />
            </div>
            <p className="text-secondary" style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '2rem' }}>
              #{shortId}
            </p>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ width: '100%' }}>
              Fechar Ingresso
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
