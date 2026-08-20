import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fetchMovies() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.log('TMDB_API_KEY nao encontrada. Usando filmes de fallback.');
    return [
      {
        externalId: '101',
        title: 'Homem-Aranha: Um Novo Dia',
        posterUrl: '/spiderman_poster.jpg',
        backdropUrl: '/spiderman_backdrop.jpg',
        dateOffset: 7, 
        location: 'Cine Araújo - Sala VIP 1',
        price: 45.00,
        type: 'MOVIE'
      },
      {
        externalId: '105',
        title: 'Duna: Parte Dois',
        posterUrl: '/dune_poster.jpg',
        backdropUrl: '/yDHYTfA3R0jFYba16ZFApuigH1Z.jpg',
        dateOffset: 10, 
        location: 'Cine Araújo - Sala 3',
        price: 40.00,
        type: 'MOVIE'
      }
    ];
  }

  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR`);
    const data = await res.json();
    return data.results.slice(0, 5).map((movie: any, index: number) => ({
      externalId: movie.id.toString(),
      title: movie.title,
      posterUrl: movie.poster_path ? movie.poster_path : null, // TMDB path
      backdropUrl: movie.backdrop_path ? movie.backdrop_path : null,
      dateOffset: index + 2,
      location: 'Cine Multiplex',
      price: 35.00 + (Math.random() * 20),
      type: 'MOVIE'
    }));
  } catch (err) {
    console.error('Erro ao buscar do TMDB, usando fallback:', err);
    return [];
  }
}

async function fetchShows() {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    console.log('TICKETMASTER_API_KEY nao encontrada. Usando shows de fallback.');
    return [
      {
        externalId: '201',
        title: 'Coldplay - Music of the Spheres',
        posterUrl: '/coldplay_poster.jpg',
        backdropUrl: 'https://images.unsplash.com/photo-1540039155732-6761b54f22ce?q=80&w=1200&auto=format&fit=crop',
        dateOffset: 30, 
        location: 'Estádio do Morumbi',
        price: 450.00,
        type: 'SHOW'
      },
      {
        externalId: '203',
        title: 'Lollapalooza 2027',
        posterUrl: '/lolla_poster.png',
        backdropUrl: 'https://images.unsplash.com/photo-1470229722913-7c090be5c5a4?q=80&w=1200&auto=format&fit=crop',
        dateOffset: 120, 
        location: 'Autódromo de Interlagos',
        price: 1200.00,
        type: 'SHOW'
      }
    ];
  }

  try {
    const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&countryCode=BR&classificationName=music&size=5`);
    const data = await res.json();
    if (!data._embedded || !data._embedded.events) return [];
    
    return data._embedded.events.map((event: any, index: number) => {
      // Pega a melhor imagem 16:9
      const image = event.images?.find((img: any) => img.ratio === '16_9') || event.images?.[0];
      return {
        externalId: event.id,
        title: event.name,
        posterUrl: image?.url || null,
        backdropUrl: image?.url || null, // Usando a mesma pra simplificar na API deles
        dateOffset: 10 + (index * 10),
        location: event._embedded?.venues?.[0]?.name || 'Arena Principal',
        price: 300.00 + (Math.random() * 500),
        type: 'SHOW'
      };
    });
  } catch (err) {
    console.error('Erro ao buscar do Ticketmaster, usando fallback:', err);
    return [];
  }
}

async function main() {
  await prisma.reservation.deleteMany()
  await prisma.seat.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()

  const organizador = await prisma.user.create({
    data: { name: 'João Organizador', email: 'organizador@elite.com', role: 'ORGANIZER' }
  })

  const cliente1 = await prisma.user.create({
    data: { name: 'Maria Cliente', email: 'maria@cliente.com', role: 'CLIENT' }
  })

  const movies = await fetchMovies();
  const shows = await fetchShows();
  const allEvents = [...movies, ...shows];

  const createdEvents = [];

  for (const evt of allEvents) {
    const created = await prisma.event.create({
      data: {
        externalId: evt.externalId,
        title: evt.title,
        posterUrl: evt.posterUrl,
        backdropUrl: evt.backdropUrl,
        date: new Date(Date.now() + evt.dateOffset * 24 * 60 * 60 * 1000), 
        location: evt.location,
        price: evt.price,
        capacity: 100,
        type: evt.type,
        organizerId: organizador.id
      }
    });
    createdEvents.push(created);
  }

  // Funcao para criar mapa visual (FILMES)
  const createMatrixSeats = async (eventId: string) => {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsPerRow = 10;
    const seatsData = [];
    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        seatsData.push({
          eventId: eventId,
          row: row,
          number: i,
          status: 'AVAILABLE'
        });
      }
    }
    await prisma.seat.createMany({ data: seatsData });
  }

  // Funcao para criar ingressos por setor (SHOWS)
  const createSectorSeats = async (eventId: string) => {
    const seatsData = [];
    // 50 ingressos de Pista
    for (let i = 1; i <= 50; i++) {
      seatsData.push({ eventId, row: 'PISTA', number: i, status: 'AVAILABLE' });
    }
    // 20 ingressos de Camarote
    for (let i = 1; i <= 20; i++) {
      seatsData.push({ eventId, row: 'CAMAROTE', number: i, status: 'AVAILABLE' });
    }
    await prisma.seat.createMany({ data: seatsData });
  }

  for (const event of createdEvents) {
    if (event.type === 'MOVIE') {
      await createMatrixSeats(event.id);
    } else {
      await createSectorSeats(event.id);
    }
  }

  console.log(`Seed executado com sucesso! ${createdEvents.length} eventos criados (buscados via API/Fallback).`)
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
