import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}></span>
          <span className="text-gradient">Elite Tickets</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Eventos</Link>
          <Link href="/meus-ingressos" className={styles.navLink}>Meus Ingressos</Link>
          <Link href="/organizador" className={styles.navLink}>Área do Organizador</Link>
          <Link href="/portaria" className={styles.navLink}>Portaria</Link>
        </nav>
      </div>
    </header>
  );
}
