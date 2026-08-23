'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Perfil.module.css';

const AVATARS = [
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Brian',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Sara',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Mia',
];

export default function PerfilClient({ initialProfile, sessionToken }: { initialProfile: any, sessionToken: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dados');
  
  // States
  const [formData, setFormData] = useState({
    name: initialProfile.name || '',
    email: initialProfile.email || '',
    city: initialProfile.city || '',
    phone: initialProfile.phone || '',
    photoUrl: initialProfile.photoUrl || AVATARS[0],
    currentPassword: '',
    newPassword: '',
  });

  const [preferences, setPreferences] = useState<{newsletter: boolean, sms: boolean}>(() => {
    try { return JSON.parse(initialProfile.preferences) || { newsletter: true, sms: false }; }
    catch { return { newsletter: true, sms: false }; }
  });

  const [paymentMocks, setPaymentMocks] = useState<{cardNumber: string, name: string, expiry: string, status: string}[]>(() => {
    const defaults = [
      { cardNumber: '**** **** **** 1234', name: initialProfile.name || 'JOÃO SILVA', expiry: '12/29', status: 'approved' },
      { cardNumber: '**** **** **** 0000', name: initialProfile.name || 'JOÃO SILVA', expiry: '12/29', status: 'declined' }
    ];
    try { 
      const parsed = JSON.parse(initialProfile.paymentMock);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (parsed && parsed.cardNumber) return [parsed, defaults[1]];
      return defaults;
    }
    catch { return defaults; }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const res = await fetch(`http://127.0.0.1:3333/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          ...formData,
          preferences: JSON.stringify(preferences),
          paymentMock: JSON.stringify(paymentMocks),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Perfil atualizado com sucesso!');
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' })); // clear passwords
        router.refresh();
      } else {
        setError(data.error || 'Erro ao atualizar o perfil');
      }
    } catch (err) {
      setError('Erro de conexão ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src={formData.photoUrl} alt="Avatar" className={styles.avatarLarge} />
          <h3 style={{ margin: '1rem 0 0.2rem' }}>{formData.name}</h3>
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>{formData.email}</p>
        </div>
        <nav className={styles.nav}>
          <button className={`${styles.navBtn} ${activeTab === 'dados' ? styles.active : ''}`} onClick={() => setActiveTab('dados')}>Dados Pessoais</button>
          <button className={`${styles.navBtn} ${activeTab === 'seguranca' ? styles.active : ''}`} onClick={() => setActiveTab('seguranca')}>Segurança</button>
          <button className={`${styles.navBtn} ${activeTab === 'pagamento' ? styles.active : ''}`} onClick={() => setActiveTab('pagamento')}>Pagamentos (Mock)</button>
          <button className={`${styles.navBtn} ${activeTab === 'preferencias' ? styles.active : ''}`} onClick={() => setActiveTab('preferencias')}>Preferências</button>
        </nav>
      </div>

      <div className={styles.content}>
        {message && <div style={{ padding: '1rem', background: 'rgba(0, 255, 0, 0.1)', color: '#4ade80', borderRadius: '8px', marginBottom: '1.5rem' }}>{message}</div>}
        {error && <div style={{ padding: '1rem', background: 'rgba(255, 0, 0, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

        {activeTab === 'dados' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2>Meus Dados</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Escolha um Avatar</label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {AVATARS.map(avatar => (
                  <img 
                    key={avatar} 
                    src={avatar} 
                    alt="avatar option" 
                    className={`${styles.avatarOption} ${formData.photoUrl === avatar ? styles.selectedAvatar : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, photoUrl: avatar }))}
                  />
                ))}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Nome Completo</label>
              <input type="text" name="name" className="input" value={formData.name} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>E-mail</label>
              <input type="email" name="email" className="input" value={formData.email} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Cidade</label>
              <input type="text" name="city" className="input" value={formData.city} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Telefone <span style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>(Opcional)</span></label>
              <input type="tel" name="phone" className="input" value={formData.phone} onChange={handleChange} placeholder="(11) 99999-9999" />
              <div style={{fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'0.25rem'}}>Usado caso opte por receber avisos por SMS nas Preferências.</div>
            </div>
          </div>
        )}

        {activeTab === 'seguranca' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2>Alterar Senha</h2>
            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>Para alterar sua senha, informe a senha atual.</p>
            <div className={styles.inputGroup}>
              <label>Senha Atual</label>
              <input type="password" name="currentPassword" className="input" value={formData.currentPassword} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Nova Senha</label>
              <input type="password" name="newPassword" className="input" value={formData.newPassword} onChange={handleChange} />
            </div>
          </div>
        )}

        {activeTab === 'pagamento' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2>Métodos de Pagamento</h2>
            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>Seus cartões salvos para compras rápidas. (Ambiente Simulado)</p>
            
            {paymentMocks.map((mock, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '50px', height: '32px', background: mock.status === 'declined' ? 'var(--danger)' : 'var(--accent-neon)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: mock.status === 'declined' ? '#fff' : '#000', fontWeight: 'bold', fontSize: '0.75rem' }}>VISA</div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{mock.cardNumber} {mock.status === 'declined' ? '(Recusado)' : ''}</div>
                    <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Expira em {mock.expiry}</div>
                  </div>
                </div>
                <button 
                  className="btn btn-secondary" 
                  style={{ color: 'var(--danger)', borderColor: 'rgba(220, 38, 38, 0.3)' }}
                  onClick={() => setPaymentMocks(prev => prev.filter((_, i) => i !== idx))}
                >
                  Remover
                </button>
              </div>
            ))}
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '0.5rem', width: '100%' }}
              onClick={() => {
                const newCard = { 
                  cardNumber: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`, 
                  name: formData.name || 'NOVO CARTAO', 
                  expiry: '12/32', 
                  status: 'approved' 
                };
                setPaymentMocks(prev => [...prev, newCard]);
              }}
            >
              + Adicionar Novo Cartão Simulado
            </button>
          </div>
        )}

        {activeTab === 'preferencias' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2>Preferências de Notificação</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', padding: '1rem', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
              <input 
                type="checkbox" 
                checked={preferences.newsletter} 
                onChange={(e) => setPreferences(prev => ({ ...prev, newsletter: e.target.checked }))}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 'bold' }}>Newsletter e Ofertas</div>
                <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Receber e-mails com novos filmes e descontos.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', padding: '1rem', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
              <input 
                type="checkbox" 
                checked={preferences.sms} 
                onChange={(e) => setPreferences(prev => ({ ...prev, sms: e.target.checked }))}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 'bold' }}>Avisos por SMS</div>
                <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Receber confirmação de ingresso via SMS.</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
