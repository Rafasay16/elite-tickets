'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/AuthService';
import styles from './page.module.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await AuthService.login(email, password);

      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.push('/');
      }
      router.refresh(); // Força o Header a buscar a nova sessão

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (type: 'client' | 'admin') => {
    if (type === 'client') {
      setEmail('rafael@gmail.com');
      setPassword('123456');
    } else {
      setEmail('admin@admin.com');
      setPassword('123456');
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={`glass-panel ${styles.loginBox}`}>
          <h1 className="neon-text">Acesso</h1>
          <p className={styles.subtitle}>Entre para reservar seus ingressos.</p>

          <form onSubmit={handleLogin} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.inputGroup}>
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                placeholder="seu@email.com"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
                placeholder="******"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? 'Autenticando...' : 'Entrar'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
              Não tem uma conta? <Link href="/cadastro" style={{ color: 'var(--accent-neon)', textDecoration: 'none' }}>Cadastre-se</Link>
            </div>
          </form>

          <div className={styles.demoAccounts}>
            <p>Contas de Demonstração (Portfólio):</p>
            <div className={styles.demoButtons}>
              <button type="button" onClick={() => handleDemoFill('client')} className="btn btn-secondary">
                Preencher Cliente
              </button>
              <button type="button" onClick={() => handleDemoFill('admin')} className="btn btn-secondary" style={{ borderColor: 'var(--accent-neon-glow)'}}>
                Preencher Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
