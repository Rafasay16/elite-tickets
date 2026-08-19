import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import { PrismaClient } from "@prisma/client";
import { getImageUrl } from "@/lib/tmdb";
import { CalendarIcon, MapPinIcon } from "@/components/Icons";
import styles from "./page.module.css";

const prisma = new PrismaClient();

// Forçamos a página a ser renderizada dinamicamente para sempre pegar os dados mais recentes do banco local
export const dynamic = 'force-dynamic';

export default async function Home() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { date: "asc" },
  });

  return (
    <main>
      <Header />
      
      <section className={styles.hero}>
        <div className="container">
          <h1 className="neon-text">Estreias Exclusivas</h1>
          <p className="text-secondary">Garanta seu lugar nas sessões mais aguardadas do ano.</p>
        </div>
      </section>

      <section className="container">
        <div className={styles.grid}>
          {events.map((event) => (
            <Link href={`/evento/${event.id}`} key={event.id} className={styles.card}>
              <div className={styles.posterWrapper}>
                <Image
                  src={getImageUrl(event.posterUrl)}
                  alt={`Pôster de ${event.title}`}
                  fill
                  className={styles.poster}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className={styles.overlay}>
                  <span className="btn btn-primary">Reservar Assento</span>
                </div>
              </div>
              <div className={styles.cardInfo}>
                <h3>{event.title}</h3>
                <div className={styles.meta}>
                  <span><CalendarIcon /> {new Date(event.date).toLocaleDateString('pt-BR')}</span>
                  <span><MapPinIcon /> {event.location}</span>
                </div>
                <div className={styles.price}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(event.price)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
