const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.event.updateMany({
    where: {
      title: 'De Volta Para o Futuro'
    },
    data: {
      title: 'De Volta Para o Futuro (reexibição)'
    }
  });
  console.log('Titulo atualizado no banco de dados!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
