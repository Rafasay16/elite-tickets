'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/AuthService';
import styles from '../login/page.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await AuthService.register(name, email, password, city);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={`glass-panel ${styles.loginBox}`}>
          <h1 className="neon-text">Cadastro</h1>
          <p className={styles.subtitle}>Crie sua conta para reservar ingressos.</p>

          <form onSubmit={handleRegister} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.inputGroup}>
              <label htmlFor="name">Nome Completo</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={styles.input}
                placeholder="Seu nome"
              />
            </div>

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

            <div className={styles.inputGroup}>
              <label htmlFor="city">Sua Cidade</label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className={styles.input}
                placeholder="Ex: São Paulo"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
              Já tem uma conta? <Link href="/login" style={{ color: 'var(--accent-neon)', textDecoration: 'none' }}>Fazer Login</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
