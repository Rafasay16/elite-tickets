import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../models/prisma';
import bcrypt from 'bcryptjs';

export class AdminController {
  static async listOrganizers(req: AuthRequest, res: Response) {
    try {
      const organizers = await prisma.user.findMany({
        where: { role: 'ORGANIZER' },
        select: { id: true, name: true, email: true, cpf: true, cnpj: true, responsavel: true, isActive: true, serviceFeeRate: true, eventLimit: true }
      });
      return res.json({ organizers });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async createOrganizer(req: AuthRequest, res: Response) {
    try {
      const { name, email, password, cpf, cnpj, responsavel } = req.body;
      if (!name || !email || !password || !cpf || !responsavel) {
        return res.status(400).json({ error: 'Dados obrigatórios faltando' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ error: 'Email já existe' });

      const existingCpf = await prisma.user.findUnique({ where: { cpf } });
      if (existingCpf) return res.status(400).json({ error: 'CPF já cadastrado' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const organizer = await prisma.user.create({
        data: {
          name, email, password: hashedPassword, cpf, cnpj, responsavel, role: 'ORGANIZER', isActive: true
        }
      });

      return res.json({ success: true, organizer });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updatePassword(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { password } = req.body;
      if (!password) return res.status(400).json({ error: 'Senha obrigatória' });

      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword }
      });

      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const updated = await prisma.user.update({
        where: { id },
        data: { isActive }
      });
      return res.json({ success: true, organizer: updated });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateLimits(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { serviceFeeRate, eventLimit } = req.body;
      const updated = await prisma.user.update({
        where: { id },
        data: {
          serviceFeeRate: serviceFeeRate ? parseFloat(serviceFeeRate) : undefined,
          eventLimit: eventLimit ? parseInt(eventLimit) : undefined
        }
      });
      return res.json({ success: true, organizer: updated });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
