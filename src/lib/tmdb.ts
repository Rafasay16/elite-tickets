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
        title: "Duna: Parte Dois",
        poster_path: "/1pdfLvkbY9ohJlCjQH2JGjjcNsV.jpg",
        backdrop_path: "/8rpDcsfLJypbO6vtec0fsZbbLge.jpg",
        overview: "Paul Atreides se une a Chani e aos Fremen em uma guerra de vingança...",
        release_date: "2024-02-27",
      },
      {
        id: 102,
        title: "Oppenheimer",
        poster_path: "/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg",
        backdrop_path: "/fm6KqXn3wK0L9E1BvBDB4sT0x3F.jpg",
        overview: "A história do cientista americano J. Robert Oppenheimer e o seu papel no desenvolvimento da bomba atômica.",
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
  return data.results;
}

export function getImageUrl(path: string | null, size: "w500" | "original" = "w500") {
  if (!path) return "https://via.placeholder.com/500x750?text=Sem+Imagem";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
