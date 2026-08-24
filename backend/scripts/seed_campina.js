const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const organizer = await prisma.user.findFirst({ where: { role: 'ORGANIZER' } });
  
  if (!organizer) {
    console.log('Organizador não encontrado');
    return;
  }

  // Criar o Homem-Aranha em Campina Grande
  const campinaEvent = await prisma.event.create({
    data: {
      externalId: '557', // ID do TMDb do Homem-Aranha que já existe no seu BD
      type: 'MOVIE',
      title: 'Homem-Aranha',
      description: 'Peter Parker lida com as consequências de sua identidade revelada.',
      posterUrl: '/spiderman_poster.jpg',
      backdropUrl: '/spiderman_backdrop.jpg',
      date: new Date('2026-08-25T20:00:00.000Z'), // Uma data no futuro
      location: 'Cine Campina',
      city: 'Campina Grande',
      price: 25.0,
      capacity: 50,
      maxTicketsPerUser: 4,
      organizerId: organizer.id,
      status: 'PUBLISHED'
    }
  });

  // Criar assentos para essa sessão
  const seats = [];
  ['A', 'B'].forEach(row => {
    for (let i = 1; i <= 5; i++) {
      seats.push({
        eventId: campinaEvent.id,
        row,
        number: i,
        status: 'AVAILABLE'
      });
    }
  });

  await prisma.seat.createMany({ data: seats });
  console.log('Evento em Campina Grande criado com sucesso!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
