const { PrismaClient } = require('@prisma/client');
const https = require('https');
require('dotenv').config();

const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error("ERRO: TMDB_API_KEY não encontrada no arquivo .env");
  process.exit(1);
}

function fetchTMDB(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function mapCertification(cert) {
  if (!cert) return '14'; // Padrão se não achar
  
  const cleanCert = cert.trim().toUpperCase();
  if (cleanCert === 'L') return 'Livre';
  if (cleanCert === '10') return '10';
  if (cleanCert === '12') return '12';
  if (cleanCert === '14') return '14';
  if (cleanCert === '16') return '16';
  if (cleanCert === '18') return '18';
  
  return '14'; // Padrão seguro
}

async function main() {
  const movies = await prisma.event.findMany({
    where: { type: 'MOVIE' }
  });

  console.log(`Encontrados ${movies.length} sessões de filmes no banco.`);

  // Para não fazer requisições duplicadas para o mesmo filme
  const movieRatingsCache = {};

  for (const movie of movies) {
    if (!movie.externalId || movie.externalId.startsWith('SHOW')) continue;

    const tmdbId = movie.externalId;
    
    if (!movieRatingsCache[tmdbId]) {
      try {
        console.log(`Buscando classificação real para o filme TMDB ID: ${tmdbId} - ${movie.title}`);
        const releaseData = await fetchTMDB(`https://api.themoviedb.org/3/movie/${tmdbId}/release_dates?api_key=${TMDB_API_KEY}`);
        
        let finalRating = '14'; // fallback

        if (releaseData && releaseData.results) {
          const brRelease = releaseData.results.find(r => r.iso_3166_1 === 'BR');
          if (brRelease && brRelease.release_dates && brRelease.release_dates.length > 0) {
            // Pegar a certificação (pode ter múltiplas datas de lançamento no Brasil, pega a primeira que tiver certificação)
            const dateWithCert = brRelease.release_dates.find(d => d.certification);
            if (dateWithCert && dateWithCert.certification) {
              finalRating = mapCertification(dateWithCert.certification);
            }
          } else {
             // Tentar usar o do US se não tiver do BR (US: G = Livre, PG = 10, PG-13 = 12/14, R = 16/18)
             const usRelease = releaseData.results.find(r => r.iso_3166_1 === 'US');
             if (usRelease && usRelease.release_dates && usRelease.release_dates.length > 0) {
               const dateWithCert = usRelease.release_dates.find(d => d.certification);
               if (dateWithCert && dateWithCert.certification) {
                 const usCert = dateWithCert.certification;
                 if (usCert === 'G' || usCert === 'PG') finalRating = 'Livre';
                 else if (usCert === 'PG-13') finalRating = '12';
                 else if (usCert === 'R' || usCert === 'NC-17') finalRating = '16';
               }
             }
          }
        }
        
        movieRatingsCache[tmdbId] = finalRating;
      } catch (err) {
        console.error(`Erro ao buscar TMDB ID ${tmdbId}:`, err);
        movieRatingsCache[tmdbId] = '14'; // Falha
      }
    }

    const correctRating = movieRatingsCache[tmdbId];
    
    if (movie.rating !== correctRating) {
      await prisma.event.update({
        where: { id: movie.id },
        data: { rating: correctRating }
      });
      console.log(` -> Atualizado: ${movie.title} para ${correctRating}`);
    }
  }

  console.log('Classificações reais dos filmes atualizadas com sucesso!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
