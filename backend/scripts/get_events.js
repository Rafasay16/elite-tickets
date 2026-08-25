const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalizeText(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  const events = await prisma.event.findMany({
    select: { id: true, title: true, type: true, city: true }
  });
  console.log(`Total events: ${events.length}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
