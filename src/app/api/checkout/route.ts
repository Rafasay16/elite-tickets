import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { eventId, seatId } = await req.json();

    // 1. Validar Sessão
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Usuário não autenticado. Faça login.' }, { status: 401 });
    }

    const userId = session.id;

    const result = await prisma.$transaction(async (tx) => {
      // 2. Checar Limite de Ingressos do Usuário para este Evento
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new Error('Evento não encontrado');

      const userReservations = await tx.reservation.count({
        where: { 
          userId, 
          eventId,
          status: { in: ['RESERVED', 'PAID'] } 
        }
      });

      if (userReservations >= event.maxTicketsPerUser) {
        throw new Error(`Você atingiu o limite máximo de ${event.maxTicketsPerUser} ingressos para este evento.`);
      }

      // 3. Checar Disponibilidade do Assento
      const seat = await tx.seat.findUnique({ where: { id: seatId } });
      
      if (!seat || seat.status !== 'AVAILABLE') {
        throw new Error('Este assento já foi reservado ou vendido.');
      }

      // 4. Bloquear Assento (Status SOLD temporário no nível do assento para evitar dupla compra)
      await tx.seat.update({
        where: { id: seatId },
        data: { status: 'SOLD' }
      });

      // 5. Criar Reserva Temporária (10 minutos)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos a partir de agora

      const reservation = await tx.reservation.create({
        data: {
          eventId,
          userId,
          seatId,
          status: 'RESERVED',
          expiresAt,
        }
      });

      return reservation;
    });

    return NextResponse.json({ success: true, reservation: result });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
