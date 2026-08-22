import Link from 'next/link';
import { getSession } from '@/lib/auth';
import LogoutButton from './LogoutButton';
import CitySelector from './CitySelector';
import SearchModal from './SearchModal';
import styles from './Header.module.css';
import ThemeToggle from './ThemeToggle';
import { cookies } from 'next/headers';

export default async function Header() {
  const session = await getSession();
  const cookieStore = cookies();
  let currentCity = cookieStore.get('city')?.value || 'Todo o Brasil';
  if (session && session.city) {
    currentCity = session.city;
  }

  let photoUrl = '';
  const rawToken = cookieStore.get('token')?.value;
  if (session && rawToken) {
    try {
      const res = await fetch(`http://127.0.0.1:3333/api/users/profile`, {
        headers: { Authorization: `Bearer ${rawToken}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        photoUrl = data.profile?.photoUrl || '';
      }
    } catch(e) {}
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
                {(session.role === 'PORTARIA' || session.role === 'ORGANIZER' || session.role === 'SUPER_ADMIN') && (
                  <Link href="/portaria" className={styles.navLink}>Portaria</Link>
                )}
              </>
            ) : null}
          </nav>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem' }}>
            <SearchModal />
            <CitySelector initialCity={currentCity} />
            <ThemeToggle />
          </div>

          <div style={{ marginLeft: '1rem', borderLeft: '1px solid var(--border-glass)', paddingLeft: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {session ? (
              <>
                <Link href="/perfil" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-neon)' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-neon)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {session.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Olá, {session.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-neon)' }}>Meu Perfil</span>
                  </div>
                </Link>
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
