import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../models/prisma';
import { config } from '../config';
import { LoginInput, RegisterInput } from '../types';

export class AuthService {
  static async login(data: LoginInput) {
    const { email, password } = data;
    if (!email || !password) throw new Error('Email e senha são obrigatórios');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Credenciais inválidas');

    const isValid = await bcrypt.compare(password, user.password || '');
    if (!isValid) throw new Error('Credenciais inválidas');

    if (user.role === 'ORGANIZER' && !user.isActive) {
      throw new Error('Conta de organizador inativa.');
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, city: user.city }, config.jwtAuthSecret, { expiresIn: '8h' });

    return { token, role: user.role, city: user.city };
  }

  static async register(data: RegisterInput) {
    const { name, email, password, city } = data;
    if (!name || !email || !password || !city) throw new Error('Dados incompletos');

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'CLIENT', city }
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, city: user.city }, config.jwtAuthSecret, { expiresIn: '8h' });

    return { token, role: user.role, city: user.city };
  }
}
