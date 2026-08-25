'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/AuthService';
import styles from '../login/page.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [selectedState, setSelectedState] = useState('');
  const [city, setCity] = useState('');
  
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then(data => setStates(data))
      .catch(err => console.error('Erro ao buscar estados', err));
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      return;
    }
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?orderBy=nome`)
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error('Erro ao buscar cidades', err));
  }, [selectedState]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) {
      setError('Por favor, selecione sua cidade.');
      return;
    }
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                <label htmlFor="state">Estado (UF)</label>
                <select
                  id="state"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  required
                  className={styles.input}
                  style={{ appearance: 'auto', width: '100%' }}
                >
                  <option value="" style={{ color: 'black' }}>Selecione</option>
                  {states.map(state => (
                    <option key={state.id} value={state.sigla} style={{ color: 'black' }}>{state.nome}</option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                <label htmlFor="city">Sua Cidade</label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  disabled={!selectedState || cities.length === 0}
                  className={styles.input}
                  style={{ appearance: 'auto', opacity: (!selectedState || cities.length === 0) ? 0.5 : 1, width: '100%' }}
                >
                  <option value="" style={{ color: 'black' }}>Selecione</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.nome} style={{ color: 'black' }}>{c.nome}</option>
                  ))}
                </select>
              </div>
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
