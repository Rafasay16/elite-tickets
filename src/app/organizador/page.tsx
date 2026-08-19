import Header from "@/components/Header";
import { fetchPopularMovies } from "@/lib/tmdb";
import EventForm from "@/components/EventForm";

export const dynamic = 'force-dynamic';

export default async function OrganizadorPage() {
  const movies = await fetchPopularMovies();

  return (
    <main>
      <Header />
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <h1 className="neon-text" style={{ marginBottom: '1rem' }}>Painel do Organizador</h1>
        <p className="text-secondary" style={{ marginBottom: '3rem' }}>Selecione um filme do catálogo (TMDb) para criar uma sessão de estreia.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {movies.map((movie) => (
            <EventForm key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </main>
  );
}
