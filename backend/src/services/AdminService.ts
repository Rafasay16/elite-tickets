import prisma from '../models/prisma';
import bcrypt from 'bcryptjs';

export class AdminService {
  static async listOrganizers() {
    const organizers = await prisma.user.findMany({
      where: { role: 'ORGANIZER' },
      select: { id: true, name: true, email: true, cpf: true, cnpj: true, responsavel: true, isActive: true, feeRate: true, eventLimit: true }
    });
    return organizers;
  }

  static async createOrganizer(data: any) {
    const { name, email, password, cpf, cnpj, responsavel } = data;
    if (!name || !email || !password || !cpf || !responsavel) {
      throw new Error('Dados obrigatórios faltando');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email já existe');

    const existingCpf = await prisma.user.findUnique({ where: { cpf } });
    if (existingCpf) throw new Error('CPF já cadastrado');

    const hashedPassword = await bcrypt.hash(password, 10);
    const organizer = await prisma.user.create({
      data: {
        name, email, password: hashedPassword, cpf, cnpj, responsavel, role: 'ORGANIZER', isActive: true
      }
    });

    return organizer;
  }

  static async updatePassword(id: string, data: any) {
    const { password } = data;
    if (!password) throw new Error('Senha obrigatória');

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    return { success: true };
  }

  static async updateStatus(id: string, data: any) {
    const { isActive } = data;
    const updated = await prisma.user.update({
      where: { id },
      data: { isActive }
    });
    return updated;
  }

  static async updateLimits(id: string, data: any) {
    const { feeRate, eventLimit } = data;
    const updatedData: any = {};
    if (feeRate !== undefined) updatedData.feeRate = parseFloat(feeRate);
    if (eventLimit !== undefined) updatedData.eventLimit = parseInt(eventLimit);

    const updated = await prisma.user.update({
      where: { id },
      data: updatedData
    });
    return updated;
  }
}
