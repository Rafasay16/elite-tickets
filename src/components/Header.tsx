import Link from 'next/link';
import styles from './Header.module.css';
import ThemeToggle from './ThemeToggle';

export default function Header() {
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
            <Link href="/meus-ingressos" className={styles.navLink}>Meus Ingressos</Link>
            <Link href="/organizador" className={styles.navLink}>Área do Organizador</Link>
            <Link href="/portaria" className={styles.navLink}>Portaria</Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
