'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const defaultAvatar = session?.name 
    ? `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(session.name)}` 
    : '';

  const [avatarUrl, setAvatarUrl] = useState<string>(photoUrl || defaultAvatar);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync avatar dynamically on mount and route change
  useEffect(() => {
    if (photoUrl) {
      setAvatarUrl(photoUrl);
      setImgError(false);
    } else if (session?.name) {
      setAvatarUrl(`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(session.name)}`);
    }

    if (session) {
      const syncProfile = async () => {
        try {
          const cookies = document.cookie.split(';');
          const tokenCookie = cookies.find((c) => c.trim().startsWith('token='));
          if (tokenCookie) {
            const token = tokenCookie.split('=')[1];
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
            const res = await fetch(`${apiUrl}/users/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              if (data.profile?.photoUrl) {
                setAvatarUrl(data.profile.photoUrl);
                setImgError(false);
              }
            }
          }
        } catch (e) {}
      };
      syncProfile();
    }
  }, [photoUrl, session, pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

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

        {/* FERRAMENTAS & PERFIL */}
        <div className={styles.actionsRight}>
          
          {/* Busca visível em Desktop e Mobile */}
          <SearchModal />

          {/* Ferramentas que aparecem apenas no Desktop */}
          <div className={styles.desktopOnly}>
            <CitySelector initialCity={currentCity} />
            <ThemeToggle />
          </div>

          <div className={styles.divider} />

          {/* PERFIL DESKTOP */}
          {session ? (
            <div className={styles.userMenuWrapper} ref={dropdownRef}>
              <button 
                type="button" 
                className={styles.userTrigger}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {avatarUrl && !imgError ? (
                  <Image 
                    src={avatarUrl} 
                    alt="Avatar" 
                    width={32} 
                    height={32} 
                    className={styles.avatar} 
                    unoptimized
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className={styles.avatarFallback}>
                    {session.name ? session.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{session.name ? session.name.split(' ')[0] : 'Usuário'}</span>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Meu Perfil
                  </Link>

                  {session.role === 'CLIENT' && (
                    <Link href="/meus-ingressos" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                      </svg>
                      Meus Ingressos
                    </Link>
                  )}

                  {session.role === 'ORGANIZER' && (
                    <Link href="/admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Painel Super Admin
                    </Link>
                  )}

                  {(session.role === 'PORTARIA' || session.role === 'ORGANIZER' || session.role === 'SUPER_ADMIN') && (
                    <Link href="/portaria" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Controle de Portaria
                    </Link>
                  )}

                  <button type="button" onClick={handleLogout} className={`${styles.dropdownItem} ${styles.dropdownItemLogout}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
            <div className={styles.desktopOnly}>
              <Link href="/login" className="btn btn-primary" style={{ padding: '0.45rem 1.4rem', fontSize: '0.9rem' }}>
                Entrar
              </Link>
            </div>
          )}

          {/* BOTÃO HAMBÚRGUER MOBILE (OS TRÊS TRACINHOS) */}
          <button 
            type="button" 
            className={styles.mobileToggle}
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu de navegação"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* GAVETA LATERAL MOBILE RENDERIZADA VIA PORTAL DIRETAMENTE NO BODY */}
      {mounted && drawerOpen && createPortal(
        <div className={styles.mobileDrawerOverlay} onClick={() => setDrawerOpen(false)}>
          <div className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            <div>
              <div className={styles.drawerHeader}>
                <div className={styles.logo}>
                  <div className={styles.logoIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2 2z" />
                    </svg>
                  </div>
                  <span className={styles.logoText}>Elite<span className={styles.logoHighlight}>Tickets</span></span>
                </div>
                <button type="button" className={styles.drawerCloseBtn} onClick={() => setDrawerOpen(false)} aria-label="Fechar menu">
                  &times;
                </button>
              </div>

              {/* CARD DE USUÁRIO SE ESTIVER LOGADO */}
              {session && (
                <div className={styles.drawerUserCard}>
                  {avatarUrl && !imgError ? (
                    <Image src={avatarUrl} alt="Avatar" width={40} height={40} className={styles.avatar} unoptimized onError={() => setImgError(true)} />
                  ) : (
                    <div className={styles.avatarFallback} style={{ width: 40, height: 40, fontSize: '1rem' }}>
                      {session.name ? session.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {session.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-neon)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {getRoleLabel(session.role)}
                    </div>
                  </div>
                </div>
              )}

              {/* LINKS DE NAVEGAÇÃO DA PLATAFORMA */}
              <nav className={styles.drawerNavList}>
                <Link 
                  href="/" 
                  className={`${styles.drawerNavLink} ${isLinkActive('/') ? styles.drawerNavLinkActive : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span>Catálogo de Eventos</span>
                </Link>

                {session && session.role === 'CLIENT' && (
                  <Link 
                    href="/meus-ingressos" 
                    className={`${styles.drawerNavLink} ${isLinkActive('/meus-ingressos') ? styles.drawerNavLinkActive : ''}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                    </svg>
                    <span>Meus Ingressos</span>
                  </Link>
                )}

                {session && session.role === 'ORGANIZER' && (
                  <>
                    <Link 
                      href="/admin" 
                      className={`${styles.drawerNavLink} ${isLinkActive('/admin') ? styles.drawerNavLinkActive : ''}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      <span>Painel Admin</span>
                    </Link>
                    <Link 
                      href="/portaria" 
                      className={`${styles.drawerNavLink} ${isLinkActive('/portaria') ? styles.drawerNavLinkActive : ''}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span>Painel Super Admin</span>
                    </Link>
                    <Link 
                      href="/portaria" 
                      className={`${styles.drawerNavLink} ${isLinkActive('/portaria') ? styles.drawerNavLinkActive : ''}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>Portaria</span>
                    </Link>
                  </>
                )}

                {session && session.role === 'PORTARIA' && (
                  <Link 
                    href="/portaria" 
                    className={`${styles.drawerNavLink} ${isLinkActive('/portaria') ? styles.drawerNavLinkActive : ''}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Controle de Portaria</span>
                  </Link>
                )}

                {session && (
                  <Link 
                    href="/perfil" 
                    className={`${styles.drawerNavLink} ${isLinkActive('/perfil') ? styles.drawerNavLinkActive : ''}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Meu Perfil</span>
                  </Link>
                )}
              </nav>

              {/* SEÇÃO DE PREFERÊNCIAS (CIDADE E TEMA) */}
              <div className={styles.drawerPreferences}>
                <div className={styles.drawerPrefRow}>
                  <span className={styles.drawerPrefLabel}>Sua Cidade</span>
                  <CitySelector initialCity={currentCity} />
                </div>
                <div className={styles.drawerPrefRow}>
                  <span className={styles.drawerPrefLabel}>Tema Visual</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>

            {/* RODAPÉ DO DRAWER MOBILE */}
            <div className={styles.drawerFooter}>
              {session ? (
                <button 
                  type="button" 
                  onClick={handleLogout} 
                  className="btn btn-secondary" 
                  style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sair da Conta
                </button>
              ) : (
                <Link href="/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', padding: '0.75rem' }}>
                  Entrar na Conta
                </Link>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
