import Link from 'next/link';
import { getSession } from '@/lib/auth';
import LogoutButton from './LogoutButton';
import CitySelector from './CitySelector';
import styles from './Header.module.css';
import ThemeToggle from './ThemeToggle';
import { cookies } from 'next/headers';

export default async function Header() {
  const session = await getSession();
  const cookieStore = cookies();
  let currentCity = cookieStore.get('city')?.value || 'São Paulo';
  if (session && session.city) {
    currentCity = session.city;
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}></span>
          <span className="text-gradient">Elite Tickets</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>Eventos</Link>
            
            {session ? (
              <>
                {session.role === 'CLIENT' && (
                  <Link href="/meus-ingressos" className={styles.navLink}>Meus Ingressos</Link>
                )}
                {session.role === 'ORGANIZER' && (
                  <Link href="/admin" className={styles.navLink}>Painel Admin</Link>
                )}
                {session.role === 'SUPER_ADMIN' && (
                  <Link href="/super-admin" className={styles.navLink}>Painel Super Admin</Link>
                )}
                {session.role === 'PORTARIA' && (
                  <Link href="/portaria" className={styles.navLink}>Portaria</Link>
                )}
              </>
            ) : null}
          </nav>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem' }}>
            <CitySelector initialCity={currentCity} />
            <ThemeToggle />
          </div>

          <div style={{ marginLeft: '1rem', borderLeft: '1px solid var(--border-glass)', paddingLeft: '1rem', display: 'flex', alignItems: 'center' }}>
            {session ? (
              <>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Olá, {session.name}</span>
                <LogoutButton />
              </>
            ) : (
              <Link href="/login" className="btn btn-primary" style={{ padding: '0.4rem 1.5rem' }}>Entrar</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
