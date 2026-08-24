require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany();
  console.log(`Encontrados ${events.length} eventos para atualizar.`);

  for (const event of events) {
    let newRating = '14'; // Padrão
    const title = event.title.toLowerCase();

    if (event.type === 'SHOW') {
      newRating = '16';
    } else {
      if (title.includes('minion') || title.includes('monstro') || title.includes('divertida') || title.includes('toy story') || title.includes('mario') || title.includes('moana') || title.includes('rei leão') || title.includes('frozen') || title.includes('shrek') || title.includes('meu malvado')) {
        newRating = 'Livre';
      } else if (title.includes('deadpool') || title.includes('alien') || title.includes('coringa') || title.includes('joker') || title.includes('saw') || title.includes('jogos mortais') || title.includes('terror') || title.includes('massacre') || title.includes('demônio') || title.includes('morte') || title.includes('obsessão')) {
        newRating = '18';
      } else if (title.includes('wolverine') || title.includes('gladiador') || title.includes('matrix') || title.includes('dia d')) {
        newRating = '16';
      } else if (title.includes('venom') || title.includes('batman') || title.includes('vingadores') || title.includes('avengers') || title.includes('spider-man') || title.includes('aranha')) {
        newRating = '12';
      } else {
        newRating = '14';
      }
    }

    if (event.rating !== newRating) {
      await prisma.event.update({
        where: { id: event.id },
        data: { rating: newRating }
      });
      console.log(` -> Atualizado: ${event.title} para ${newRating}`);
    }
  }

  console.log('Classificações indicativas atualizadas com sucesso!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
