import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { reservationId } = await req.json();

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });
      
      if (!reservation) throw new Error('Reserva não encontrada.');
      if (reservation.userId !== session.id) throw new Error('Não autorizado.');
      
      // Checar se expirou
      if (reservation.expiresAt && new Date() > reservation.expiresAt && reservation.status === 'RESERVED') {
        // Se expirou, o cronJob ou a tela de listagem já deveria ter limpado, mas limpamos na hora do pagamento por segurança
        await tx.reservation.update({ where: { id: reservationId }, data: { status: 'CANCELLED' } });
        await tx.seat.update({ where: { id: reservation.seatId }, data: { status: 'AVAILABLE' } });
        throw new Error('Sua reserva expirou e o ingresso voltou para o estoque.');
      }

      if (reservation.status === 'PAID') {
        throw new Error('Este ingresso já foi pago.');
      }

      // Efetiva o pagamento
      const updated = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'PAID' }
      });

      return updated;
    });

    return NextResponse.json({ success: true, reservation: result });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
