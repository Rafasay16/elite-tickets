import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { qrCode } = await req.json();

    if (!qrCode) return NextResponse.json({ error: 'QR Code não fornecido' }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { qrCode },
        include: { event: true, seat: true }
      });

      if (!reservation) {
        throw new Error('INGRESSO INVÁLIDO');
      }

      if (reservation.status === 'USED') {
        throw new Error('INGRESSO JÁ UTILIZADO');
      }

      if (reservation.status !== 'PAID') {
        throw new Error('INGRESSO PENDENTE DE PAGAMENTO');
      }

      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: 'USED' }
      });

      return reservation;
    });

    return NextResponse.json({ 
      success: true, 
      message: 'VÁLIDO',
      details: `${result.event.title} - Fila ${result.seat.row} Assento ${result.seat.number}`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
