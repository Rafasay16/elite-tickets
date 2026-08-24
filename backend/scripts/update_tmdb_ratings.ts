import { PrismaClient } from '@prisma/client';
import { TMDBService } from '../src/services/TMDBService';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const movies = await prisma.event.findMany({
    where: { type: 'MOVIE' }
  });

  console.log(`Encontrados ${movies.length} sessões de filmes no banco.`);

  const movieRatingsCache: Record<string, string> = {};

  for (const movie of movies) {
    if (!movie.externalId || movie.externalId.startsWith('SHOW')) continue;

    const tmdbId = movie.externalId;
    
    if (!movieRatingsCache[tmdbId]) {
      console.log(`Buscando classificação real para o filme TMDB ID: ${tmdbId} - ${movie.title}`);
      const correctRating = await TMDBService.getMovieRating(tmdbId);
      movieRatingsCache[tmdbId] = correctRating;
    }

    const correctRating = movieRatingsCache[tmdbId];
    
    if (movie.rating !== correctRating) {
      await prisma.event.update({
        where: { id: movie.id },
        data: { rating: correctRating }
      });
      console.log(` -> Atualizado: ${movie.title} para ${correctRating}`);
    } else {
      console.log(` -> OK: ${movie.title} já está com a classificação correta (${correctRating})`);
    }
  }

  console.log('Classificações reais dos filmes verificadas/atualizadas com sucesso!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
