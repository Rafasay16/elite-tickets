const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = {
  "Homem-Aranha: Um Novo Dia": "Peter Parker precisa lidar com as consequências de suas escolhas em um novo e perigoso dia para o Homem-Aranha, enfrentando novos vilões e desafios inesperados na cidade de Nova York.",
  "A Odisseia": "Uma épica jornada de sobrevivência e descobrimento. Acompanhe os heróis através de mares perigosos e criaturas místicas na busca incansável pelo caminho de volta para casa.",
  "Toy Story 5": "Woody, Buzz e a turma retornam para uma nova aventura emocionante! Desta vez, eles descobrem que o mundo dos brinquedos está mudando mais rápido do que imaginavam.",
  "Rage of Stars": "Em um futuro distante, facções intergalácticas entram em guerra pelo controle da última estrela de energia do universo.",
  "Palavra Cantada | Ribeirão Preto": "Venha cantar e se divertir com a dupla Palavra Cantada em um show repleto de música, brincadeiras e muita alegria para toda a família!",
  "Rock in Rio 2026": "O maior festival de música do mundo está de volta! Prepare-se para dias inesquecíveis com as maiores bandas de rock e pop do planeta.",
  "Maroon 5: Love Is Like World Tour - São José do Rio Preto": "A banda norte-americana Maroon 5 traz seus maiores sucessos para o interior de São Paulo em uma noite que promete ser inesquecível.",
  "Maroon 5: Love Is Like World Tour - São Paulo": "Maroon 5 aterrissa na capital paulista com a Love Is Like World Tour, trazendo um setlist recheado de hits que marcaram gerações."
};

async function main() {
  for (const [title, description] of Object.entries(updates)) {
    await prisma.event.updateMany({
      where: { title: title },
      data: { description: description }
    });
  }
  console.log('Todas as sinopses antigas foram atualizadas!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
