'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, TicketIcon, FlameIcon, BoltIcon } from '@/components/Icons';
import ShareButton from '@/components/ShareButton';
import { getImageUrl } from '@/lib/tmdb';
import { CheckoutService } from '@/services/CheckoutService';
import styles from './page.module.css';

type Reservation = {
  id: string;
  qrDataUrl: string;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    posterUrl?: string | null;
  };
  seat: {
    id: string;
    row: string;
    number: number;
  };
};

export default function MeusIngressosClient({
  initialReservations,
  sucesso,
}: {
  initialReservations: Reservation[];
  sucesso?: string;
}) {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const [selectedTicketForZoom, setSelectedTicketForZoom] = useState<Reservation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  // Escape key to dismiss QR modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTicketForZoom(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const now = useMemo(() => new Date(), []);

  const { upcomingTickets, pastTickets } = useMemo(() => {
    const upcoming: Reservation[] = [];
    const past: Reservation[] = [];

    initialReservations.forEach((res) => {
      const eventDate = new Date(res.event.date);
      if (eventDate < now) {
        past.push(res);
      } else {
        upcoming.push(res);
      }
    });

    return {
      upcomingTickets: upcoming.sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime()),
      pastTickets: past.sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime()),
    };
  }, [initialReservations, now]);

  const activeList = activeTab === 'UPCOMING' ? upcomingTickets : pastTickets;

  const getEventTimingBadge = (dateStr: string) => {
    const evtDate = new Date(dateStr);
    const diffMs = evtDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return <span className={`${styles.timingBadge} ${styles.timingPast}`}>Encerrado</span>;
    }
    if (diffDays <= 0 || (evtDate.getDate() === now.getDate() && evtDate.getMonth() === now.getMonth())) {
      return <span className={`${styles.timingBadge} ${styles.timingToday}`}><FlameIcon /> É Hoje!</span>;
    }
    if (diffDays === 1) {
      return <span className={`${styles.timingBadge} ${styles.timingToday}`}><BoltIcon /> Amanhã</span>;
    }
    return <span className={`${styles.timingBadge} ${styles.timingUpcoming}`}>Em {diffDays} dias</span>;
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Deseja realmente remover este ingresso arquivado do seu histórico?')) return;
    setDeletingId(ticketId);
    try {
      await CheckoutService.deleteTicket(ticketId);
      router.refresh();
    } catch (e: any) {
      alert(e.message || 'Erro ao remover ingresso');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem', maxWidth: '1100px' }}>
      
      {/* SUCCESS BANNER POST-CHECKOUT */}
      {sucesso && (
        <div className={styles.successBanner}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Reserva confirmada com sucesso! Seu ingresso com QR Code já está liberado para entrada na portaria.</span>
        </div>
      )}

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            Meus <span className="text-gradient">Ingressos</span>
          </h1>
          <p className={styles.subtitle}>
            Acesse seus passes de entrada com QR Code de alta resolução para validação rápida na portaria.
          </p>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className={styles.tabsContainer}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'UPCOMING' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('UPCOMING')}
        >
          <span>Próximos Eventos</span>
          <span className={styles.tabCount}>{upcomingTickets.length}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'PAST' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('PAST')}
        >
          <span>Histórico / Passados</span>
          <span className={styles.tabCount}>{pastTickets.length}</span>
        </button>
      </div>

      {/* TICKET CARDS LIST */}
      {activeList.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrapper}>
            <TicketIcon size={32} />
          </div>
          <h3 className={styles.emptyTitle}>
            {activeTab === 'UPCOMING' ? 'Nenhum ingresso ativo no momento' : 'Nenhum evento no seu histórico'}
          </h3>
          <p className={styles.emptyText}>
            {activeTab === 'UPCOMING'
              ? 'Você ainda não possui ingressos para os próximos dias. Explore as estreias de cinema e grandes shows disponíveis na sua cidade!'
              : 'Seus ingressos de eventos passados e encerrados ficarão arquivados aqui.'}
          </p>
          {activeTab === 'UPCOMING' && (
            <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.75rem' }}>
              <span>Explorar Catálogo de Eventos</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {activeList.map((res) => {
            const shortId = res.id.split('-')[0].toUpperCase();
            const isPast = new Date(res.event.date) < now;

            return (
              <div
                key={res.id}
                className={`${styles.ticketCard} ${isPast ? styles.ticketCardExpired : ''}`}
              >
                {/* LADO ESQUERDO: INFORMAÇÕES DO EVENTO */}
                <div className={styles.ticketMain}>
                  <div className={styles.eventRow}>
                    <div className={styles.posterWrapper}>
                      <Image
                        src={getImageUrl(res.event.posterUrl || null)}
                        alt={`Pôster de ${res.event.title}`}
                        fill
                        className={styles.poster}
                        sizes="72px"
                      />
                    </div>

                    <div className={styles.eventDetails}>
                      {getEventTimingBadge(res.event.date)}

                      <h3 className={styles.eventTitle} title={res.event.title}>
                        {res.event.title}
                      </h3>

                      <div className={styles.metaItem}>
                        <CalendarIcon />
                        <span>
                          {new Date(res.event.date).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <div className={styles.metaItem} title={res.event.location}>
                        <MapPinIcon />
                        <span>{res.event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.seatRow}>
                    <div className={styles.seatBadge}>
                      Fila {res.seat.row} &bull; Assento {res.seat.number}
                    </div>

                    <ShareButton qrCode={res.id} disabled={isPast} />
                  </div>
                </div>

                {/* LADO DIREITO: CANHOTO COM QR CODE EMBUTIDO */}
                <div className={styles.ticketStub}>
                  <div className={styles.cutoutTop}></div>
                  <div className={styles.cutoutBottom}></div>

                  <div
                    className={styles.qrContainer}
                    onClick={() => setSelectedTicketForZoom(res)}
                    title="Clique para ampliar o QR Code"
                  >
                    <Image
                      src={res.qrDataUrl}
                      alt="QR Code do Ingresso"
                      width={100}
                      height={100}
                      className={styles.qrCodeImg}
                      unoptimized
                    />
                  </div>

                  <span className={styles.shortCode}>#{shortId}</span>

                  <div className={styles.stubActions}>
                    <button
                      type="button"
                      className={styles.expandBtn}
                      onClick={() => setSelectedTicketForZoom(res)}
                      title="Exibir QR Code em Tela Cheia"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                      Ampliar
                    </button>

                    {isPast && (
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(res.id)}
                        disabled={deletingId === res.id}
                      >
                        {deletingId === res.id ? 'Excluindo...' : 'Remover'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: QR CODE AMPLIADO PARA PORTARIA */}
      {selectedTicketForZoom && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedTicketForZoom(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-heading-family)', fontSize: '1.25rem', marginBottom: '0.4rem' }}>
              Passe de Portaria
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Apresente este código diretamente ao leitor da equipe de entrada.
            </p>

            <div className={styles.qrModalBox}>
              <Image
                src={selectedTicketForZoom.qrDataUrl}
                alt="QR Code em Alta Resolução"
                width={220}
                height={220}
                unoptimized
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-heading-family)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                {selectedTicketForZoom.event.title}
              </div>
              <div style={{ color: 'var(--accent-neon)', fontWeight: 700, fontSize: '0.9rem' }}>
                Fila {selectedTicketForZoom.seat.row} - Assento {selectedTicketForZoom.seat.number}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', letterSpacing: '0.1em' }}>
                ID: #{selectedTicketForZoom.id.split('-')[0].toUpperCase()}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedTicketForZoom(null)}
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Fechar Passe
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
