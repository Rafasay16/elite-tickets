const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const organizers = await prisma.user.findMany({
      where: { role: 'ORGANIZER' },
      select: { id: true, name: true, email: true, isActive: true, feeRate: true, eventLimit: true }
    });
    console.log(organizers);
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  }
}

main().finally(() => prisma.$disconnect());
