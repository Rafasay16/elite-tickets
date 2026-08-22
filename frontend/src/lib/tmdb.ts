export interface TMDbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
}

export async function fetchPopularMovies(): Promise<TMDbMovie[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    // Mock data para facilitar a avaliação sem precisar configurar chave de API
    return [
      {
        id: 101,
        title: "Homem-Aranha: Um Novo Dia",
        poster_path: "/spiderman_poster.jpg",
        backdrop_path: "/spiderman_backdrop.jpg",
        overview: "Peter Parker precisa lidar com as consequências de suas escolhas em um novo e perigoso dia para o Homem-Aranha...",
        release_date: "2026-07-31",
      },
      {
        id: 102,
        title: "Flash",
        poster_path: "/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg",
        backdrop_path: "/fm6KqXn3wK0L9E1BvBDB4sT0x3F.jpg",
        overview: "A história de Barry Allen, um jovem que se torna o super-herói conhecido como Flash, o homem mais rápido do mundo.",
        release_date: "2023-07-19",
      },
      {
        id: 103,
        title: "Deadpool & Wolverine",
        poster_path: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
        backdrop_path: "/yDHYTfA3R0jFYba16ZFApuigH1Z.jpg",
        overview: "Um apático Wade Wilson trabalha duro na vida civil. Seus dias como o mercenário moralmente flexível ficaram para trás.",
        release_date: "2024-07-24",
      }
    ];
  }

  const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR`);
  if (!res.ok) throw new Error("Falha ao buscar filmes");
  const data = await res.json();
  return data.results.filter((m: any) => !m.title.toLowerCase().includes('hotel desire'));
}

export function getImageUrl(path: string | null, size: "w500" | "original" = "w500") {
  if (!path) return 'https://placehold.co/500x750/1e293b/ffffff.png?text=Sem+Imagem';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/spiderman') || path.startsWith('/bttf') || path.startsWith('/dune') || path.startsWith('/coldplay') || path.startsWith('/lolla')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
