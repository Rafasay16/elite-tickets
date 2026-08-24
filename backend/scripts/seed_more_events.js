const { PrismaClient } = require('@prisma/client');
const https = require('https');
require('dotenv').config();

const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error("ERRO: TMDB_API_KEY não encontrada no arquivo .env");
  process.exit(1);
}

const CITIES = [
  'Campina Grande',
  'João Pessoa'
];

const SHOW_ARTISTS = [
  'Coldplay',
  'Taylor Swift',
  'Bruno Mars',
  'The Weeknd',
  'Ivete Sangalo',
  'Alok',
  'Gusttavo Lima',
  'Jorge & Mateus'
];

const LOCATIONS = [
  'Allianz Parque',
  'Estádio Maracanã',
  'Mineirão',
  'Pedreira Paulo Leminski',
  'Arena Fonte Nova',
  'Classic Hall',
  'Estádio Mané Garrincha',
  'Arena Castelão',
  'Teatro Municipal',
  'Espaço Unimed'
];

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

async function main() {
  const organizer = await prisma.user.findFirst({ where: { role: 'ORGANIZER' } });
  
  if (!organizer) {
    console.log('Organizador não encontrado');
    return;
  }

  console.log('Buscando filmes populares no TMDB...');
  let tmdbMovies = [];
  try {
    const response = await fetchTMDB(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=2`);
    if (response && response.results) {
      tmdbMovies = response.results.slice(0, 20); // Pegar 20 filmes novos
    }
  } catch (err) {
    console.error('Erro ao buscar TMDB:', err);
  }

  if (tmdbMovies.length === 0) {
    console.log('Nenhum filme retornado do TMDB.');
    return;
  }

  console.log(`Encontrados ${tmdbMovies.length} filmes.`);

  const newEvents = [];
  
  // Distribuir Filmes
  for (let i = 0; i < tmdbMovies.length; i++) {
    const movie = tmdbMovies[i];
    // Escolher as cidades
    const selectedCities = [...CITIES]; // Vamos colocar em ambas as cidades
    
    for (const city of selectedCities) {
      const location = `Cine Araújo - ${city}`;
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 30) + 1); // Próximos 30 dias
      
      newEvents.push({
        externalId: movie.id.toString(),
        type: 'MOVIE',
        title: movie.title,
        description: movie.overview || 'Sem sinopse disponível.',
        posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
        date: date,
        location: location,
        city: city,
        price: 35.0,
        capacity: 100,
        maxTicketsPerUser: 4,
        organizerId: organizer.id,
        status: 'PUBLISHED',
        category: 'Legendado/Dublado'
      });
    }
  }

  // Criar Shows
  for (let i = 0; i < SHOW_ARTISTS.length; i++) {
    const artist = SHOW_ARTISTS[i];
    const selectedCities = [...CITIES]; // Colocar em ambas as cidades
    
    for (const city of selectedCities) {
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 60) + 15); // Daqui a 15-75 dias
      
      newEvents.push({
        externalId: `SHOW_${artist.replace(/\s+/g, '')}_${city}`,
        type: 'SHOW',
        title: `Tour ${artist} 2026`,
        description: `O maior show de ${artist} chegando em ${city}!`,
        posterUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(artist)}&background=random&size=500`, // mock poster
        backdropUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(artist)}&background=random&size=1200`, // mock backdrop
        date: date,
        location: location,
        city: city,
        price: 250.0,
        capacity: 500,
        maxTicketsPerUser: 2,
        organizerId: organizer.id,
        status: 'PUBLISHED',
        category: 'Pista Premium / Arquibancada'
      });
    }
  }

  console.log(`Criando ${newEvents.length} eventos no banco de dados...`);
  
  for (const event of newEvents) {
    const created = await prisma.event.create({ data: event });
    
    // Criar assentos
    const seats = [];
    const rows = ['A', 'B', 'C', 'D'];
    rows.forEach(row => {
      for (let s = 1; s <= 10; s++) {
        seats.push({
          eventId: created.id,
          row,
          number: s,
          status: 'AVAILABLE'
        });
      }
    });
    await prisma.seat.createMany({ data: seats });
  }

  console.log('Eventos e Assentos criados com sucesso!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
