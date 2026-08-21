import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../models/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_123';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(401).json({ error: 'Credenciais inválidas' });

      if (user.role === 'ORGANIZER' && !user.isActive) {
        return res.status(403).json({ error: 'Conta de organizador inativa.' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, city: user.city }, JWT_SECRET, { expiresIn: '8h' });

      return res.json({ token, role: user.role, city: user.city });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, city } = req.body;
      if (!name || !email || !password || !city) return res.status(400).json({ error: 'Dados incompletos' });

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ error: 'Email já cadastrado' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role: 'CLIENT', city }
      });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, city: user.city }, JWT_SECRET, { expiresIn: '8h' });

      return res.json({ token, role: user.role, city: user.city });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
