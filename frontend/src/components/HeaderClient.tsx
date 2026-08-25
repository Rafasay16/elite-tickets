'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import SearchModal from './SearchModal';
import CitySelector from './CitySelector';
import ThemeToggle from './ThemeToggle';
import { AuthService } from '@/services/AuthService';
import styles from './Header.module.css';

interface SessionData {
  id?: string;
  name: string;
  email?: string;
  role: 'CLIENT' | 'ORGANIZER' | 'SUPER_ADMIN' | 'PORTARIA' | string;
  city?: string;
}

interface HeaderClientProps {
  session: SessionData | null;
  photoUrl: string;
  currentCity: string;
}

export default function HeaderClient({ session, photoUrl, currentCity }: HeaderClientProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ORGANIZER': return 'Organizador';
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'PORTARIA': return 'Portaria';
      case 'CLIENT': return 'Cliente';
      default: return 'Usuário';
    }
  };

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        
        {/* LOGO COM ÍCONE VETORIAL */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
              <path d="M13 5v2" />
              <path d="M13 17v2" />
              <path d="M13 11v2" />
            </svg>
          </div>
          <span className={styles.logoText}>
            Elite<span className={styles.logoHighlight}>Tickets</span>
          </span>
        </Link>

        {/* NAVEGAÇÃO DESKTOP BASEADA EM ROLE */}
        <nav className={styles.desktopNav}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${isLinkActive('/') ? styles.navLinkActive : ''}`}
          >
            Eventos
          </Link>
          
          {session && (
            <>
              {session.role === 'CLIENT' && (
                <Link 
                  href="/meus-ingressos" 
                  className={`${styles.navLink} ${isLinkActive('/meus-ingressos') ? styles.navLinkActive : ''}`}
                >
                  Meus Ingressos
                </Link>
              )}

              {session.role === 'ORGANIZER' && (
                <>
                  <Link 
                    href="/admin" 
                    className={`${styles.navLink} ${isLinkActive('/admin') ? styles.navLinkActive : ''}`}
                  >
                    Painel Admin
                  </Link>
                  <Link 
                    href="/portaria" 
                    className={`${styles.navLink} ${isLinkActive('/portaria') ? styles.navLinkActive : ''}`}
                  >
                    Portaria
                  </Link>
                </>
              )}

              {session.role === 'SUPER_ADMIN' && (
                <>
                  <Link 
                    href="/super-admin" 
                    className={`${styles.navLink} ${isLinkActive('/super-admin') ? styles.navLinkActive : ''}`}
                  >
                    Painel Super Admin
                  </Link>
                  <Link 
                    href="/portaria" 
                    className={`${styles.navLink} ${isLinkActive('/portaria') ? styles.navLinkActive : ''}`}
                  >
                    Portaria
                  </Link>
                </>
              )}

              {session.role === 'PORTARIA' && (
                <Link 
                  href="/portaria" 
                  className={`${styles.navLink} ${isLinkActive('/portaria') ? styles.navLinkActive : ''}`}
                >
                  Portaria
                </Link>
              )}
            </>
          )}
        </nav>

        {/* FERRAMENTAS & PERFIL NA DIREITA */}
        <div className={styles.actionsRight}>
          <div className={styles.toolsGroup}>
            <SearchModal />
            <CitySelector initialCity={currentCity} />
            <ThemeToggle />
          </div>

          <div className={styles.divider} />

          {/* ESTADO DO USUÁRIO */}
          {session ? (
            <div className={styles.userMenuWrapper} ref={dropdownRef}>
              <button 
                type="button" 
                className={styles.userTrigger}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {photoUrl ? (
                  <Image 
                    src={photoUrl} 
                    alt="Avatar" 
                    width={32} 
                    height={32} 
                    className={styles.avatar} 
                  />
                ) : (
                  <div className={styles.avatarFallback}>
                    {session.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{session.name.split(' ')[0]}</span>
                  <span className={styles.userRoleBadge}>{getRoleLabel(session.role)}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* DROPDOWN MENU */}
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownUserName}>{session.name}</div>
                    {session.email && <div className={styles.dropdownUserEmail}>{session.email}</div>}
                    <div style={{ marginTop: '0.25rem' }}>
                      <span className={styles.userRoleBadge}>{getRoleLabel(session.role)}</span>
                    </div>
                  </div>

                  <Link href="/perfil" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Meu Perfil
                  </Link>

                  {session.role === 'CLIENT' && (
                    <Link href="/meus-ingressos" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                      </svg>
                      Meus Ingressos
                    </Link>
                  )}

                  {session.role === 'ORGANIZER' && (
                    <Link href="/admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      Painel Organizador
                    </Link>
                  )}

                  {session.role === 'SUPER_ADMIN' && (
                    <Link href="/super-admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Painel Super Admin
                    </Link>
                  )}

                  {(session.role === 'PORTARIA' || session.role === 'ORGANIZER' || session.role === 'SUPER_ADMIN') && (
                    <Link href="/portaria" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Controle de Portaria
                    </Link>
                  )}

                  <button type="button" onClick={handleLogout} className={`${styles.dropdownItem} ${styles.dropdownItemLogout}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sair da Conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.45rem 1.4rem', fontSize: '0.9rem' }}>
              Entrar
            </Link>
          )}

          {/* BOTÃO HAMBÚRGUER MOBILE */}
          <button 
            type="button" 
            className={styles.mobileToggle}
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* GAVETA LATERAL MOBILE (DRAWER) */}
      {drawerOpen && (
        <div className={styles.mobileDrawerOverlay} onClick={() => setDrawerOpen(false)}>
          <div className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            <div>
              <div className={styles.drawerHeader}>
                <div className={styles.logo}>
                  <div className={styles.logoIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                    </svg>
                  </div>
                  <span className={styles.logoText}>Elite<span className={styles.logoHighlight}>Tickets</span></span>
                </div>
                <button type="button" className={styles.drawerCloseBtn} onClick={() => setDrawerOpen(false)}>
                  &times;
                </button>
              </div>

              {/* LISTA DE ROTAS POR PAPEL */}
              <nav className={styles.drawerNavList}>
                <Link 
                  href="/" 
                  className={`${styles.drawerNavLink} ${isLinkActive('/') ? styles.drawerNavLinkActive : ''}`}
                >
                  <span>Eventos</span>
                </Link>

                {session && session.role === 'CLIENT' && (
                  <Link 
                    href="/meus-ingressos" 
                    className={`${styles.drawerNavLink} ${isLinkActive('/meus-ingressos') ? styles.drawerNavLinkActive : ''}`}
                  >
                    <span>Meus Ingressos</span>
                  </Link>
                )}

                {session && session.role === 'ORGANIZER' && (
                  <>
                    <Link 
                      href="/admin" 
                      className={`${styles.drawerNavLink} ${isLinkActive('/admin') ? styles.drawerNavLinkActive : ''}`}
                    >
                      <span>Painel Admin</span>
                    </Link>
                    <Link 
                      href="/portaria" 
                      className={`${styles.drawerNavLink} ${isLinkActive('/portaria') ? styles.drawerNavLinkActive : ''}`}
                    >
                      <span>Portaria</span>
                    </Link>
                  </>
                )}

                {session && session.role === 'SUPER_ADMIN' && (
                  <>
                    <Link 
                      href="/super-admin" 
                      className={`${styles.drawerNavLink} ${isLinkActive('/super-admin') ? styles.drawerNavLinkActive : ''}`}
                    >
                      <span>Painel Super Admin</span>
                    </Link>
                    <Link 
                      href="/portaria" 
                      className={`${styles.drawerNavLink} ${isLinkActive('/portaria') ? styles.drawerNavLinkActive : ''}`}
                    >
                      <span>Portaria</span>
                    </Link>
                  </>
                )}

                {session && session.role === 'PORTARIA' && (
                  <Link 
                    href="/portaria" 
                    className={`${styles.drawerNavLink} ${isLinkActive('/portaria') ? styles.drawerNavLinkActive : ''}`}
                  >
                    <span>Portaria</span>
                  </Link>
                )}

                {session && (
                  <Link 
                    href="/perfil" 
                    className={`${styles.drawerNavLink} ${isLinkActive('/perfil') ? styles.drawerNavLinkActive : ''}`}
                  >
                    <span>Meu Perfil</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* RODAPÉ DO DRAWER MOBILE */}
            <div className={styles.drawerFooter}>
              {session ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {photoUrl ? (
                      <Image src={photoUrl} alt="Avatar" width={36} height={36} className={styles.avatar} />
                    ) : (
                      <div className={styles.avatarFallback}>{session.name.charAt(0).toUpperCase()}</div>
                    )}
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'white' }}>{session.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-neon)' }}>{getRoleLabel(session.role)}</div>
                    </div>
                  </div>
                  <button type="button" onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}>
                    Sair da Conta
                  </button>
                </div>
              ) : (
                <Link href="/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                  Entrar na Conta
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
