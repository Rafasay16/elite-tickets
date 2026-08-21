const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.event.updateMany({
    where: {
      title: 'De Volta Para o Passado (Expirado)'
    },
    data: {
      title: 'De Volta Para o Futuro',
      posterUrl: '/bttf_poster.jpg',
      backdropUrl: '/bttf_poster.jpg'
    }
  });
  console.log('Evento antigo atualizado no banco de dados!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
