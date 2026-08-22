import prisma from '../models/prisma';
import bcrypt from 'bcryptjs';

export class UserService {
  static async getMyTickets(userId: string) {
    const reservations = await prisma.reservation.findMany({
      where: { userId, status: 'PAID' },
      include: { event: true, seat: true },
      orderBy: { createdAt: 'desc' }
    });
    return reservations;
  }

  static async deleteReservation(id: string, userId: string) {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    
    if (!reservation || reservation.userId !== userId) {
      throw new Error('Acesso negado');
    }

    await prisma.reservation.delete({ where: { id } });
    
    await prisma.seat.update({
      where: { id: reservation.seatId },
      data: { status: 'AVAILABLE' }
    });

    return { success: true };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error('Usuário não encontrado');

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async updateProfile(data: any, userId: string) {
    const { name, email, city, phone, photoUrl, preferences, paymentMock, currentPassword, newPassword } = data;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new Error('Usuário não encontrado');

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
         throw new Error('Você não tem uma senha definida para atualizar');
      }
      const isValid = await bcrypt.compare(currentPassword, user.password || '');
      if (!isValid) throw new Error('Senha atual incorreta');
      
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  static async createPorteiro(data: any, creatorId: string) {
    const { name, email, password } = data;
    
    if (!name || !email || !password) {
      throw new Error('Faltam dados obrigatórios');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Este e-mail já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newPorteiro = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'PORTARIA',
        isActive: true,
        creatorId
      }
    });

    return { id: newPorteiro.id, email: newPorteiro.email, name: newPorteiro.name };
  }

  static async getPorteiros(creatorId: string) {
    const porteiros = await prisma.user.findMany({
      where: { 
        role: 'PORTARIA',
        creatorId
      },
      select: { id: true, name: true, email: true }
    });
    return porteiros;
  }

  static async deletePorteiro(id: string, creatorId: string) {
    const porteiro = await prisma.user.findUnique({ where: { id } });

    if (!porteiro || porteiro.creatorId !== creatorId) {
      throw new Error('Você não tem permissão para excluir este usuário.');
    }

    await prisma.user.delete({ where: { id } });
    return { success: true };
  }

  static async resetPorteiroPassword(id: string, newPassword: string, creatorId: string) {
    const porteiro = await prisma.user.findUnique({ where: { id } });
    if (!porteiro || porteiro.creatorId !== creatorId) {
      throw new Error('Permissão negada ou usuário não encontrado.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
    return { success: true };
  }

  static async getPorteiroLogs(id: string, creatorId: string) {
    const porteiro = await prisma.user.findUnique({ where: { id } });
    if (!porteiro || porteiro.creatorId !== creatorId) {
      throw new Error('Permissão negada ou usuário não encontrado.');
    }

    const logs = await prisma.reservation.findMany({
      where: { scannedById: id },
      include: {
        event: { select: { title: true } },
        seat: { select: { row: true, number: true } }
      },
      orderBy: { scannedAt: 'desc' }
    });
    return logs;
  }
}
