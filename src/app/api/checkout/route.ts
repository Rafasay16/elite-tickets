import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { eventId, seatId } = await req.json();

    // Na vida real, pegaríamos o usuário logado via sessão. 
    // Como o pdf pede papéis simulados, usamos "Maria Cliente" como hardcoded.
    const user = await prisma.user.findFirst({ where: { email: 'maria@cliente.com' } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });

    // Transação do Prisma para garantir que o mesmo assento não seja vendido duas vezes
    const result = await prisma.$transaction(async (tx) => {
      const seat = await tx.seat.findUnique({ where: { id: seatId } });
      
      if (!seat || seat.status !== 'AVAILABLE') {
        throw new Error('Assento não está mais disponível.');
      }

      // Atualiza o assento
      await tx.seat.update({
        where: { id: seatId },
        data: { status: 'SOLD' }
      });

      // Cria a reserva com o QR Code
      const reservation = await tx.reservation.create({
        data: {
          eventId,
          userId: user.id,
          seatId,
          status: 'PAID',
        }
      });

      return reservation;
    });

    return NextResponse.json({ success: true, reservation: result });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
