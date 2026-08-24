import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fetchMovies() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.log('TMDB_API_KEY nao encontrada. Usando filmes de fallback.');
    return [
      { externalId: '101', title: 'Homem-Aranha: Um Novo Dia', posterUrl: '/spiderman_poster.jpg', backdropUrl: '/spiderman_backdrop.jpg', dateOffset: 7, location: 'Cine IMAX', price: 45.00, type: 'MOVIE' },
      { externalId: '105', title: 'Duna: Parte Dois', posterUrl: '/dune_poster.jpg', backdropUrl: '/yDHYTfA3R0jFYba16ZFApuigH1Z.jpg', dateOffset: 10, location: 'Cine Araújo', price: 40.00, type: 'MOVIE' },
      { externalId: '106', title: 'Interestelar (Reexibição)', posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80', dateOffset: 2, location: 'Cine IMAX Premium', price: 50.00, type: 'MOVIE' },
      { externalId: '107', title: 'Matrix 5: Ressurreição', posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80', dateOffset: 12, location: 'Cinemark VIP', price: 55.00, type: 'MOVIE' },
      { externalId: '108', title: 'Blade Runner 2099', posterUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=1200&q=80', dateOffset: 15, location: 'Cine Araújo', price: 35.00, type: 'MOVIE' },
      { externalId: '109', title: 'Oppenheimer', posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80', dateOffset: 4, location: 'Cine Multiplex', price: 40.00, type: 'MOVIE' },
      { externalId: '110', title: 'Furiosa: Uma Saga Mad Max', posterUrl: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?w=1200&q=80', dateOffset: 18, location: 'Cinepolis', price: 38.00, type: 'MOVIE' },
      { externalId: '111', title: 'Avatar 3', posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80', dateOffset: 25, location: 'Cine IMAX 3D', price: 60.00, type: 'MOVIE' },
      { externalId: '112', title: 'Coringa: Folie à Deux', posterUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1200&q=80', dateOffset: 8, location: 'Cine Araújo', price: 42.00, type: 'MOVIE' },
      { externalId: '113', title: 'Deadpool & Wolverine', posterUrl: 'https://images.unsplash.com/photo-1559583109-3e7968136c99?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1559583109-3e7968136c99?w=1200&q=80', dateOffset: 5, location: 'Cinemark VIP', price: 48.00, type: 'MOVIE' }
    ];
  }

  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR`);
    const data = await res.json();
    return data.results.map((movie: any, index: number) => ({
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
      { externalId: '201', title: 'Coldplay - Music of the Spheres', posterUrl: '/coldplay_poster.jpg', backdropUrl: 'https://images.unsplash.com/photo-1540039155732-6761b54f22ce?q=80&w=1200&auto=format&fit=crop', dateOffset: 30, location: 'Estádio do Morumbi', price: 450.00, type: 'SHOW' },
      { externalId: '203', title: 'Lollapalooza 2027', posterUrl: '/lolla_poster.png', backdropUrl: 'https://images.unsplash.com/photo-1470229722913-7c090be5c5a4?q=80&w=1200&auto=format&fit=crop', dateOffset: 120, location: 'Autódromo de Interlagos', price: 1200.00, type: 'SHOW' },
      { externalId: '204', title: 'The Weeknd - After Hours', posterUrl: 'https://images.unsplash.com/photo-1493225457224-eda0e6fd1463?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1493225457224-eda0e6fd1463?w=1200&q=80', dateOffset: 45, location: 'Allianz Parque', price: 520.00, type: 'SHOW' },
      { externalId: '205', title: 'Bruno Mars', posterUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80', dateOffset: 60, location: 'Estádio Nilton Santos', price: 480.00, type: 'SHOW' },
      { externalId: '206', title: 'Taylor Swift - The Eras Tour', posterUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80', dateOffset: 25, location: 'Allianz Parque', price: 650.00, type: 'SHOW' },
      { externalId: '207', title: 'Foo Fighters', posterUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80', dateOffset: 80, location: 'Estádio Couto Pereira', price: 380.00, type: 'SHOW' },
      { externalId: '208', title: 'Rock in Rio 2026', posterUrl: 'https://images.unsplash.com/photo-1533174000253-1d59da5f2061?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1533174000253-1d59da5f2061?w=1200&q=80', dateOffset: 200, location: 'Cidade do Rock', price: 800.00, type: 'SHOW' },
      { externalId: '209', title: 'Ed Sheeran', posterUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&q=80', dateOffset: 35, location: 'Mineirão', price: 350.00, type: 'SHOW' },
      { externalId: '210', title: 'Beyoncé - Renaissance Tour', posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80', dateOffset: 90, location: 'Arena Fonte Nova', price: 750.00, type: 'SHOW' },
      { externalId: '211', title: 'Arctic Monkeys', posterUrl: 'https://images.unsplash.com/photo-1464375117522-131454156050?w=800&q=80', backdropUrl: 'https://images.unsplash.com/photo-1464375117522-131454156050?w=1200&q=80', dateOffset: 50, location: 'Jeunesse Arena', price: 420.00, type: 'SHOW' }
    ];
  }

  try {
    const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&countryCode=BR&classificationName=music&size=20`);
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

  const hashedPassword = await bcrypt.hash('123456', 10);

  const organizador = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: { isActive: true },
    create: {
      name: 'Admin Elite',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'ORGANIZER',
      isActive: true,
    }
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@elite.com' },
    update: { isActive: true },
    create: {
      name: 'Super Administrador',
      email: 'superadmin@elite.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    }
  });

  const porteiro = await prisma.user.upsert({
    where: { email: 'portaria@elite.com' },
    update: { isActive: true, creatorId: organizador.id },
    create: {
      name: 'Porteiro Principal',
      email: 'portaria@elite.com',
      password: hashedPassword,
      role: 'PORTARIA',
      isActive: true,
      creatorId: organizador.id,
    }
  });

  console.log({ organizador, superAdmin, porteiro });

  const cliente1 = await prisma.user.create({
    data: {
      name: 'Rafael Cliente',
      email: 'rafinha@gmail.com',
      password: await bcrypt.hash('123456', 10),
      role: 'CLIENT'
    }
  })

  const rawMovies = await fetchMovies();
  const movies = rawMovies.filter((m: any) => !m.title.toLowerCase().includes('hotel desire'));
  const shows = await fetchShows();
  const allEvents = [...movies, ...shows];

  const createdEvents = [];

  const uniqueCities = ['Campina Grande', 'João Pessoa', 'Recife', 'São Paulo', 'Rio de Janeiro'];

  const exactRatings: Record<string, string> = {
    'Homem-Aranha: Um Novo Dia': '12',
    'Backrooms': '16',
    'Supergirl': '12'
  };

  const ratings = ['Livre', '10', '12', '14', '16', '18'];

  for (const evt of allEvents) {
    const numCities = Math.floor(Math.random() * 3) + 2;

    let eventRating = ratings[Math.floor(Math.random() * ratings.length)] as string;
    for (const [key, rating] of Object.entries(exactRatings)) {
      if (evt.title.toLowerCase().includes(key.toLowerCase())) {
        eventRating = rating;
        break;
      }
    }

    const eventCities = new Set<string>();
    eventCities.add('Campina Grande');
    while (eventCities.size < numCities) {
      eventCities.add(uniqueCities[Math.floor(Math.random() * uniqueCities.length)]!);
    }

    for (const city of eventCities) {
      const sessionDateOffset = evt.dateOffset + Math.floor(Math.random() * 6);
      const created = await prisma.event.create({
        data: {
          externalId: evt.externalId,
          title: evt.title,
          posterUrl: evt.posterUrl,
          backdropUrl: evt.backdropUrl,
          date: new Date(Date.now() + sessionDateOffset * 24 * 60 * 60 * 1000),
          location: city === 'Campina Grande' ? (evt.type === 'MOVIE' ? 'Cine Araújo Campina Grande' : 'Parque do Povo') : evt.location,
          city: city,
          price: evt.price,
          capacity: 100,
          type: evt.type,
          rating: eventRating,
          organizerId: organizador.id
        }
      });
      createdEvents.push(created);
    }
  }

  const exclusiveEvents = [
    {
      externalId: 'EXC-1',
      title: 'O Maior São João do Mundo',
      posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      backdropUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
      date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      location: 'Parque do Povo',
      city: 'Campina Grande',
      price: 150.0,
      capacity: 500,
      type: 'SHOW',
      rating: '16',
      organizerId: organizador.id
    },
    {
      externalId: 'EXC-2',
      title: 'Festival de Verão de João Pessoa',
      posterUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
      backdropUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      location: 'Busto de Tamandaré',
      city: 'João Pessoa',
      price: 100.0,
      capacity: 500,
      type: 'SHOW',
      rating: '16',
      organizerId: organizador.id
    },
    {
      externalId: 'EXC-3',
      title: 'Galo da Madrugada - Área VIP',
      posterUrl: 'https://images.unsplash.com/photo-1533174000253-1d59da5f2061?w=800',
      backdropUrl: 'https://images.unsplash.com/photo-1533174000253-1d59da5f2061?w=1200',
      date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      location: 'Centro Histórico',
      city: 'Recife',
      price: 350.0,
      capacity: 500,
      type: 'SHOW',
      rating: '18',
      organizerId: organizador.id
    }
  ];

  for (const exc of exclusiveEvents) {
    const created = await prisma.event.create({ data: exc });
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
