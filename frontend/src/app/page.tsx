import Carousel from "@/components/Carousel";
import EventCatalog from "@/components/EventCatalog";
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';

export default async function Home() {
  const session = await getSession();
  const cookieStore = cookies();
  let currentCity = cookieStore.get('city')?.value || 'Todo o Brasil';
  if (session && session.city) {
    currentCity = session.city;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';

  let events = [];
  try {
    const res = await fetch(`${apiUrl}/events?city=${encodeURIComponent(currentCity)}`, { cache: 'no-store' });
    if (res.ok) {
      events = await res.json();
    }
  } catch (e) {
    console.error("Erro ao buscar eventos do Express");
  }

  // Agrupar eventos para exibir apenas um card por filme/show único
  const groupedEvents = Object.values(events.reduce((acc: any, event: any) => {
    const key = event.externalId || event.title;
    if (!acc[key]) {
      acc[key] = event;
    }
    return acc;
  }, {})) as any[];

  const featuredEvents = groupedEvents.slice(0, 4);

  return (
    <main>
      {/* Hero Carousel com Pausa no Hover e Controles */}
      <Carousel events={featuredEvents} />

      {/* Catálogo Interativo com Filtros Facetados e Cards Ricos */}
      <div className="container">
        <EventCatalog initialEvents={groupedEvents} currentCity={currentCity} />
      </div>
    </main>
  );
}
