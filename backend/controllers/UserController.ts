import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../models/prisma';

export class UserController {
  static async getMyTickets(req: AuthRequest, res: Response) {
    try {
      const reservations = await prisma.reservation.findMany({
        where: { userId: req.user.id, status: 'PAID' },
        include: { event: true, seat: true },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ ingressos: reservations });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteReservation(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const reservation = await prisma.reservation.findUnique({ where: { id } });
      
      if (!reservation || reservation.userId !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      await prisma.reservation.delete({ where: { id } });
      
      // Optionally release seat if needed, but since it's expired we may just delete it
      await prisma.seat.update({
        where: { id: reservation.seatId },
        data: { status: 'AVAILABLE' }
      });

      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
