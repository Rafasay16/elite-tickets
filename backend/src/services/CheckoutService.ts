import prisma from '../models/prisma';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ReserveInput, ConfirmInput, ValidateTicketInput } from '../types';

export class CheckoutService {
  static async reserve(data: ReserveInput, userId: string) {
    const { eventId, seatId } = data;
    if (!eventId || !seatId) throw new Error('Faltam dados');

    return prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new Error('Evento não existe');

      const count = await tx.reservation.count({
        where: { eventId, userId, status: { in: ['RESERVED', 'PAID'] } }
      });
      if (count >= event.maxTicketsPerUser) {
        throw new Error(`Limite de ${event.maxTicketsPerUser} ingressos atingido.`);
      }

      // UPDATE atômico condicional: só muda se status = AVAILABLE
      // Se dois requests chegam ao mesmo tempo, o segundo recebe count=0 e falha
      const result = await tx.seat.updateMany({
        where: { id: seatId, status: 'AVAILABLE' },
        data: { status: 'RESERVED' }
      });
      if (result.count === 0) throw new Error('Assento indisponível');

      const expiresAt = new Date(Date.now() + 10 * 60_000); // 10 min

      const reservation = await tx.reservation.create({
        data: { userId, eventId, seatId, status: 'RESERVED', expiresAt }
      });

      return reservation;
    });
  }

  static async confirm(data: ConfirmInput, userId: string) {
    const { reservationId } = data;
    const reservation = await prisma.reservation.findUnique({ 
      where: { id: reservationId },
    });
    
    if (!reservation || reservation.userId !== userId) {
      throw new Error('Reserva não encontrada');
    }
    if (reservation.status === 'PAID') throw new Error('Já pago');

    // Payload opaco: sem dados pessoais (customerName/guestName removidos)
    // Nome do titular é resolvido no servidor via reservationId
    const payload = { reservationId, timestamp: Date.now() };
    const secret = config.jwtTicketSecret;
    const qrData = jwt.sign(payload, secret);
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'PAID', expiresAt: null }
    });

    // QR armazenado na tabela Ticket separada (não mais em Reservation)
    await prisma.ticket.create({
      data: { reservationId, qrCodeData: qrData }
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
      include: { seat: true, event: true, user: { select: { name: true, email: true } }, ticket: true }
    });

    if (!reservation) throw new Error('Ingresso não encontrado');
    if (reservation.userId !== userId) throw new Error('Ingresso não encontrado ou acesso negado');
    if (reservation.status !== 'PAID' && reservation.status !== 'USED') throw new Error('Ingresso não está válido');

    return {
      ...reservation,
      event: {
        ...reservation.event,
        price: reservation.event.priceInCents / 100,
      }
    };
  }

  static async validateTicket(data: ValidateTicketInput, userId: string) {
    const { qrCode, eventId } = data;
    if (!qrCode || !eventId) throw new Error('Faltam dados: qrCode ou eventId');

    const secret = config.jwtTicketSecret;

    // jwt.verify OBRIGATÓRIO — sem fallback para jwt.decode ou busca por QR cru
    let decoded: any;
    try {
      decoded = jwt.verify(qrCode, secret);
    } catch (err) {
      throw new Error('QR Code inválido ou adulterado');
    }

    const reservationId: string | undefined = decoded.reservationId;
    if (!reservationId) {
      throw new Error('QR Code inválido: identificador ausente');
    }

    // Busca por igualdade exata — sem startsWith, sem mode insensitive
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        seat: true,
        event: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!reservation) throw new Error('Inválido: Ingresso não encontrado');
    if (reservation.eventId !== eventId) throw new Error('Evento errado');

    // Nome do titular resolvido sempre pelo banco — nunca pelo payload do JWT
    const customerName = reservation.user?.name?.trim() || reservation.user?.email?.trim() || 'Titular do Ingresso';
    
    const seatInfo = `Fila ${reservation.seat.row} - Num ${reservation.seat.number}`;
    const eventTitle = reservation.event.title;

    if (reservation.status === 'USED') {
      const err: any = new Error('JÁ UTILIZADO');
      err.data = {
        customerName,
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

    // Check-in atômico: só marca USED se status ainda for PAID
    // Se dois scanners tentam ao mesmo tempo, o segundo recebe count=0
    const updated = await prisma.reservation.updateMany({
      where: { id: reservation.id, status: 'PAID' },
      data: { status: 'USED', scannedAt, scannedById: validScannedById }
    });
    if (updated.count === 0) {
      const err: any = new Error('JÁ UTILIZADO');
      err.data = {
        customerName,
        scannedAt: reservation.scannedAt,
        seat: seatInfo,
        eventTitle,
        ticketId: reservation.id
      };
      throw err;
    }

    return {
      message: 'Acesso Liberado!',
      customerName,
      scannedAt,
      seat: seatInfo,
      eventTitle,
      ticketId: reservation.id,
      details: `Assento: ${seatInfo}`
    };
  }
}
