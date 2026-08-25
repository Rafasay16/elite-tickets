import prisma from '../models/prisma';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

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
    const reservation = await prisma.reservation.findUnique({ 
      where: { id: reservationId },
      include: { user: true }
    });
    
    if (!reservation || reservation.userId !== userId) {
      throw new Error('Reserva não encontrada');
    }
    if (reservation.status === 'PAID') throw new Error('Já pago');

    const customerName = reservation.user?.name || undefined;
    const payload = { reservationId, userId, customerName, guestName: customerName, timestamp: Date.now() };
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-123';
    const qrData = jwt.sign(payload, secret);
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

  static async getSharedTicket(id: string, userId: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { seat: true, event: true, user: { select: { name: true, email: true } } }
    });

    if (!reservation) throw new Error('Ingresso não encontrado');
    if (reservation.userId !== userId) throw new Error('Ingresso não encontrado ou acesso negado');
    if (reservation.status !== 'PAID' && reservation.status !== 'USED') throw new Error('Ingresso não está válido');

    return reservation;
  }

  static async validateTicket(data: any, userId: string) {
    const { qrCode, eventId } = data;
    if (!qrCode || !eventId) throw new Error('Faltam dados: qrCode ou eventId');

    let searchId: string;
    let tokenGuestName: string | undefined;
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-123';
    
    try {
      const decoded: any = jwt.verify(qrCode, secret);
      searchId = decoded.reservationId || decoded.id;
      if (decoded.guestName || decoded.customerName || decoded.name || decoded.userName) {
        tokenGuestName = decoded.guestName || decoded.customerName || decoded.name || decoded.userName;
      }
    } catch (err) {
      try {
        const decoded: any = jwt.decode(qrCode);
        if (decoded && (decoded.reservationId || decoded.id)) {
          searchId = decoded.reservationId || decoded.id;
          if (decoded.guestName || decoded.customerName || decoded.name || decoded.userName) {
            tokenGuestName = decoded.guestName || decoded.customerName || decoded.name || decoded.userName;
          }
        } else {
          searchId = qrCode;
        }
      } catch {
        searchId = qrCode;
      }
    }
    
    searchId = searchId.trim().replace(/^#+/, '').toLowerCase();

    const reservation = await prisma.reservation.findFirst({
      where: { 
        OR: [
          { id: { startsWith: searchId, mode: 'insensitive' } },
          { id: { equals: searchId, mode: 'insensitive' } }
        ]
      },
      include: {
        seat: true,
        event: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!reservation) throw new Error(`Inválido: Não encontrado (Buscando: ${searchId})`);
    if (reservation.eventId !== eventId) throw new Error('Evento errado');
    
    let customerName: string | undefined = tokenGuestName?.trim() || reservation.user?.name?.trim();
    if (!customerName && reservation.userId) {
      const u = await prisma.user.findUnique({ where: { id: reservation.userId } });
      customerName = u?.name?.trim() || u?.email?.trim();
    }
    const finalCustomerName = customerName || 'Titular do Ingresso';
    
    const seatInfo = `Fila ${reservation.seat.row} - Num ${reservation.seat.number}`;
    const eventTitle = reservation.event.title;

    if (reservation.status === 'USED') {
      const err: any = new Error('JÁ UTILIZADO');
      err.data = {
        customerName: finalCustomerName,
        scannedAt: reservation.scannedAt,
        seat: seatInfo,
        eventTitle,
        ticketId: reservation.id
      };
      throw err;
    }
    
    if (reservation.status !== 'PAID') throw new Error('Ingresso não pago ou cancelado.');

    const scannedAt = new Date();
    let validScannedById: string | null = null;
    if (userId) {
      try {
        const staffUser = await prisma.user.findUnique({ where: { id: userId } });
        if (staffUser) validScannedById = userId;
      } catch {}
    }

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: 'USED', scannedAt, scannedById: validScannedById }
    });

    return {
      message: 'Acesso Liberado!',
      customerName: finalCustomerName,
      scannedAt,
      seat: seatInfo,
      eventTitle,
      ticketId: reservation.id,
      details: `Assento: ${seatInfo}`
    };
  }
}
