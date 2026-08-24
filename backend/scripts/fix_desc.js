const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.event.updateMany({
    where: { 
      description: { not: null },
      NOT: { title: { contains: 'Homem-Aranha' } }
    },
    data: { description: null }
  });
  console.log('Descrições corrigidas!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
