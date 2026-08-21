const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.event.updateMany({
    where: {
      title: 'De Volta Para o Futuro'
    },
    data: {
      posterUrl: '/bttf_poster.png',
      backdropUrl: '/bttf_poster.png'
    }
  });
  console.log('Evento antigo atualizado no banco de dados para PNG!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
