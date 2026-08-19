import Header from "@/components/Header";
import { PrismaClient } from "@prisma/client";
import Image from "next/image";
import QRCode from "qrcode";
import ShareButton from "@/components/ShareButton";
import styles from "./page.module.css";
import { getImageUrl } from "@/lib/tmdb";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function MeusIngressos({ searchParams }: { searchParams: { sucesso?: string } }) {
  // uma breve simulação de login: pegando da "Maria Cliente"
  const user = await prisma.user.findFirst({ where: { email: 'maria@cliente.com' } });

  if (!user) {
    return <div>Usuário não encontrado</div>;
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    include: {
      event: true,
      seat: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  // Gerar Data URLs para os QR Codes
  const reservationsWithQr = await Promise.all(
    reservations.map(async (res) => {
      const qrDataUrl = await QRCode.toDataURL(res.qrCode, {
        color: { dark: '#0f172a', light: '#ffffff' },
        margin: 2
      });
      return { ...res, qrDataUrl };
    })
  );

  return (
    <main>
      <Header />
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        {searchParams.sucesso && (
          <div className={styles.successBanner}>
            Reserva concluída com sucesso! Seu ingresso já está disponível.
          </div>
        )}

        <h1 className="neon-text" style={{ marginBottom: '2rem' }}>Meus Ingressos</h1>

        {reservationsWithQr.length === 0 ? (
          <p className="text-secondary">Você ainda não tem ingressos.</p>
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
                    <p className="text-secondary">📍 {res.event.location}</p>
                    <p className="text-secondary">🗓️ {new Date(res.event.date).toLocaleString('pt-BR')}</p>
                    <div className={styles.seatBadge}>
                      Fila {res.seat.row} - Assento {res.seat.number}
                    </div>
                  </div>
                </div>

                <div className={styles.qrSection}>
                  <div className={styles.cutout}></div>
                  <Image src={res.qrDataUrl} alt="QR Code do Ingresso" width={150} height={150} className={styles.qrCode} />
                  <p className={styles.qrCodeText}>Apresente na portaria</p>
                  <ShareButton qrCode={res.qrCode} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
