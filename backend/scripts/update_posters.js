const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.event.updateMany({
    where: {
      posterUrl: '/d5iIlFn5s0ImszYzBPb8SPFCWKy.jpg'
    },
    data: {
      posterUrl: '/spiderman_poster.jpg',
      backdropUrl: '/spiderman_backdrop.jpg'
    }
  });
  console.log('Posters atualizados no banco de dados!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
