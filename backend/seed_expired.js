const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'rafael@gmail.com' } });
  if (!user) {
    console.log('Usuário rafael@gmail.com não encontrado');
    return;
  }

  const organizer = await prisma.user.findFirst({ where: { role: 'ORGANIZER' } });
  
  // Criar um evento expirado
  const expiredEvent = await prisma.event.create({
    data: {
      title: 'De Volta Para o Futuro',
      description: 'Este evento já aconteceu há muito tempo!',
      category: 'SHOW',
      date: new Date('2024-01-01T20:00:00.000Z'), // Data no passado
      location: 'Cine Antigo',
      price: 20.0,
      capacity: 10,
      maxTicketsPerUser: 1,
      organizerId: organizer.id,
      status: 'PUBLISHED'
    }
  });

  // Criar um assento
  const seat = await prisma.seat.create({
    data: {
      eventId: expiredEvent.id,
      row: 'A',
      number: 1,
      status: 'AVAILABLE'
    }
  });

  // Criar a reserva para o usuário
  await prisma.reservation.create({
    data: {
      userId: user.id,
      eventId: expiredEvent.id,
      seatId: seat.id,
      status: 'PAID'
    }
  });

  // Marcar assento como vendido
  await prisma.seat.update({
    where: { id: seat.id },
    data: { status: 'SOLD' }
  });

  console.log('Ingresso expirado criado com sucesso!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
