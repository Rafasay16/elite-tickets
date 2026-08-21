const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.event.updateMany({
    where: { description: null },
    data: { description: 'Pela primeira vez na história cinematográfica do Homem-Aranha, nosso herói amigo da vizinhança é desmascarado e não consegue mais separar sua vida normal dos altos riscos de ser um super-herói. Quando ele pede ajuda ao Doutor Estranho, os riscos se tornam ainda mais perigosos, e o forçam a descobrir o que realmente significa ser o Homem-Aranha.' }
  });
  console.log('Descrições atualizadas!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
