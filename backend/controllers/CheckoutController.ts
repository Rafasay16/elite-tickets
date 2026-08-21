import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../models/prisma';
import QRCode from 'qrcode';

export class CheckoutController {
  static async reserve(req: AuthRequest, res: Response) {
    try {
      const { eventId, seatId } = req.body;
      const userId = req.user.id;

      if (!eventId || !seatId) return res.status(400).json({ error: 'Faltam dados' });

      // Ver limite
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return res.status(404).json({ error: 'Evento não existe' });

      const count = await prisma.reservation.count({
        where: { eventId, userId, status: { in: ['RESERVED', 'PAID'] } }
      });
      if (count >= event.maxTicketsPerUser) {
        return res.status(400).json({ error: `Limite de ${event.maxTicketsPerUser} ingressos atingido.` });
      }

      // Tenta reservar o assento
      const seat = await prisma.seat.findUnique({ where: { id: seatId } });
      if (!seat || seat.status !== 'AVAILABLE') return res.status(400).json({ error: 'Assento indisponível' });

      await prisma.seat.update({ where: { id: seatId }, data: { status: 'RESERVED' } });

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 min

      const reservation = await prisma.reservation.create({
        data: { userId, eventId, seatId, status: 'RESERVED', expiresAt }
      });

      return res.json({ success: true, reservation });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async confirm(req: AuthRequest, res: Response) {
    try {
      const { reservationId } = req.body;
      const userId = req.user.id;

      const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
      if (!reservation || reservation.userId !== userId) {
        return res.status(404).json({ error: 'Reserva não encontrada' });
      }
      if (reservation.status === 'PAID') return res.status(400).json({ error: 'Já pago' });

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

      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
