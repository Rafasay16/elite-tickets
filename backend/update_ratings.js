const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const RATINGS = ['Livre', '10', '12', '14', '16', '18'];

async function main() {
  const events = await prisma.event.findMany();
  console.log(`Encontrados ${events.length} eventos para atualizar.`);

  for (const event of events) {
    let randomRating;
    if (event.type === 'SHOW') {
      // Shows geralmente são 16 ou 18, às vezes 14
      randomRating = ['14', '16', '16', '18', '18'][Math.floor(Math.random() * 5)];
    } else {
      // Filmes podem ser qualquer um
      randomRating = RATINGS[Math.floor(Math.random() * RATINGS.length)];
    }

    await prisma.event.update({
      where: { id: event.id },
      data: { rating: randomRating }
    });
  }

  console.log('Classificações indicativas atualizadas com sucesso!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
