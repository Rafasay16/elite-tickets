import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const organizador = await prisma.user.findFirst({ where: { email: 'organizador@elite.com' } });
    if (!organizador) return NextResponse.json({ error: 'Organizador não encontrado' }, { status: 401 });

    const event = await prisma.event.create({
      data: {
        externalId: data.externalId,
        title: data.title,
        posterUrl: data.posterUrl,
        backdropUrl: data.backdropUrl,
        date: new Date(data.date),
        location: data.location,
        price: parseFloat(data.price),
        capacity: parseInt(data.capacity),
        organizerId: organizador.id
      }
    });

    // Gerar mapa de assentos
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = Math.ceil(data.capacity / rows.length);
    let created = 0;

    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        if (created >= data.capacity) break;
        await prisma.seat.create({
          data: {
            eventId: event.id,
            row: row,
            number: i,
            status: 'AVAILABLE'
          }
        });
        created++;
      }
      if (created >= data.capacity) break;
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
