import { PrismaClient } from "@prisma/client";
import Image from "next/image";
import QRCode from "qrcode";
import ShareButton from "@/components/ShareButton";
import styles from "./page.module.css";
import { getImageUrl } from "@/lib/tmdb";
import { CalendarIcon, MapPinIcon } from "@/components/Icons";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function MeusIngressos({ searchParams }: { searchParams: { sucesso?: string } }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const reservations = await prisma.reservation.findMany({
    where: { 
      userId: session.id,
      status: 'PAID' // Mostra apenas os confirmados
    },
    include: {
      event: true,
      seat: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  // Gerar Data URLs para os QR Codes baseados no ID da reserva
  const reservationsWithQr = await Promise.all(
    reservations.map(async (res) => {
      const qrDataUrl = await QRCode.toDataURL(res.id, {
        color: { dark: '#0f172a', light: '#ffffff' },
        margin: 2
      });
      return { ...res, qrDataUrl };
    })
  );

  return (
    <main className="container" style={{ padding: '4rem 1.5rem' }}>
      
      {searchParams.sucesso && (
        <div className={styles.successBanner}>
          Reserva concluída com sucesso! Seu ingresso já está disponível.
        </div>
      )}

      <h1 className="neon-text" style={{ marginBottom: '2rem' }}>Meus Ingressos</h1>

      {reservationsWithQr.length === 0 ? (
        <p className="text-secondary">Você ainda não tem ingressos confirmados.</p>
      ) : (
        <div className={styles.grid}>
          {reservationsWithQr.map((res) => (
            <div key={res.id} className={`glass-panel ${styles.ticket}`}>
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
                <Image src={res.qrDataUrl} alt="QR Code do Ingresso" width={150} height={150} className={styles.qrCode} />
                <p className={styles.qrCodeText}>Apresente na portaria</p>
                <ShareButton qrCode={res.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
