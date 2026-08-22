import prisma from '../models/prisma';
import QRCode from 'qrcode';

export class CheckoutService {
  static async reserve(data: any, userId: string) {
    const { eventId, seatId } = data;
    if (!eventId || !seatId) throw new Error('Faltam dados');

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Evento não existe');

    const count = await prisma.reservation.count({
      where: { eventId, userId, status: { in: ['RESERVED', 'PAID'] } }
    });
    if (count >= event.maxTicketsPerUser) {
      throw new Error(`Limite de ${event.maxTicketsPerUser} ingressos atingido.`);
    }

    const seat = await prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat || seat.status !== 'AVAILABLE') throw new Error('Assento indisponível');

    await prisma.seat.update({ where: { id: seatId }, data: { status: 'RESERVED' } });

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 min

    const reservation = await prisma.reservation.create({
      data: { userId, eventId, seatId, status: 'RESERVED', expiresAt }
    });

    return reservation;
  }

  static async confirm(data: any, userId: string) {
    const { reservationId } = data;
    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
    
    if (!reservation || reservation.userId !== userId) {
      throw new Error('Reserva não encontrada');
    }
    if (reservation.status === 'PAID') throw new Error('Já pago');

    const qrData = JSON.stringify({ reservationId, userId, timestamp: Date.now() });
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'PAID', qrCodeUrl, expiresAt: null }
    });

    await prisma.seat.update({
      where: { id: reservation.seatId },
      data: { status: 'SOLD' }
    });

    return { success: true };
  }

  static async validateTicket(data: any, userId: string) {
    const { qrCode, eventId } = data;
    if (!qrCode || !eventId) throw new Error('Faltam dados: qrCode ou eventId');

    let searchId = qrCode;
    if (qrCode.startsWith('{')) {
      try {
        const parsed = JSON.parse(qrCode);
        searchId = parsed.reservationId;
      } catch(e) {}
    }
    
    searchId = searchId.replace('#', '').toLowerCase();
    let reservation = null;

    if (searchId.length < 36) {
      reservation = await prisma.reservation.findFirst({
        where: { id: { startsWith: searchId } },
        include: { seat: true, event: true }
      });
    } else {
      reservation = await prisma.reservation.findUnique({
        where: { id: searchId },
        include: { seat: true, event: true }
      });
    }

    if (!reservation) throw new Error('Inválido');
    if (reservation.eventId !== eventId) throw new Error('Evento errado');
    if (reservation.status === 'USED') throw new Error('JÁ UTILIZADO');
    if (reservation.status !== 'PAID') throw new Error('Ingresso não pago ou cancelado.');

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: 'USED' }
    });

    return `Assento: Fila ${reservation.seat.row} - Num ${reservation.seat.number}`;
  }
}
