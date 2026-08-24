const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    select: { id: true, title: true, description: true }
  });
  console.log(events);
}
main().catch(console.error).finally(() => prisma.$disconnect());
