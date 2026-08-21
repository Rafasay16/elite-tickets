import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../models/prisma';
import bcrypt from 'bcryptjs';

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

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

      // Exclude password
      const { password, ...userWithoutPassword } = user;
      return res.json({ profile: userWithoutPassword });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { name, email, city, phone, photoUrl, preferences, paymentMock, currentPassword, newPassword } = req.body;
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });

      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

      let updateData: any = {
        name,
        email,
        city,
        phone,
        photoUrl,
        preferences,
        paymentMock,
      };

      if (currentPassword && newPassword) {
        if (!user.password) {
           return res.status(400).json({ error: 'Você não tem uma senha definida para atualizar' });
        }
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) return res.status(401).json({ error: 'Senha atual incorreta' });
        
        updateData.password = await bcrypt.hash(newPassword, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData
      });

      const { password, ...userWithoutPassword } = updatedUser;
      return res.json({ success: true, profile: userWithoutPassword });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
