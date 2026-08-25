'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Perfil.module.css';

const AVATARS = [
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Brian',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Sara',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Mia',
];

interface PerfilClientProps {
  initialProfile: {
    name?: string;
    email?: string;
    city?: string;
    phone?: string;
    photoUrl?: string;
    preferences?: string;
    paymentMock?: string;
  };
  sessionToken: string;
}

export default function PerfilClient({ initialProfile, sessionToken }: PerfilClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dados' | 'seguranca' | 'pagamento' | 'preferencias'>('dados');
  
  // Form states
  const [formData, setFormData] = useState({
    name: initialProfile.name || '',
    email: initialProfile.email || '',
    city: initialProfile.city || '',
    phone: initialProfile.phone || '',
    photoUrl: initialProfile.photoUrl || AVATARS[0],
    currentPassword: '',
    newPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [preferences, setPreferences] = useState<{ newsletter: boolean; sms: boolean }>(() => {
    try {
      return JSON.parse(initialProfile.preferences || '{}') || { newsletter: true, sms: false };
    } catch {
      return { newsletter: true, sms: false };
    }
  });

  const [paymentMocks, setPaymentMocks] = useState<{ cardNumber: string; name: string; expiry: string; status: string }[]>(() => {
    const defaults = [
      { cardNumber: '**** **** **** 4892', name: initialProfile.name || 'CLIENTE ELITE', expiry: '08/29', status: 'approved' },
      { cardNumber: '**** **** **** 1024', name: initialProfile.name || 'CLIENTE ELITE', expiry: '11/27', status: 'declined' }
    ];
    try {
      const parsed = JSON.parse(initialProfile.paymentMock || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (parsed && parsed.cardNumber) return [parsed, defaults[1]];
      return defaults;
    } catch {
      return defaults;
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';
      
      const payload: any = {
        ...formData,
        preferences: JSON.stringify(preferences),
        paymentMock: JSON.stringify(paymentMocks),
      };

      if (!payload.currentPassword) delete payload.currentPassword;
      if (!payload.newPassword) delete payload.newPassword;

      const res = await fetch(`${apiUrl}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Perfil atualizado com sucesso!');
        setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
        if (formData.city) {
          document.cookie = `city=${encodeURIComponent(formData.city)}; path=/; max-age=31536000`;
        }
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

  const addNewCard = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCard = { 
      cardNumber: `**** **** **** ${randomSuffix}`, 
      name: formData.name ? formData.name.toUpperCase() : 'NOVO TITULAR', 
      expiry: '12/32', 
      status: 'approved' 
    };
    setPaymentMocks((prev) => [...prev, newCard]);
  };

  return (
    <div className={styles.container}>
      {/* SIDEBAR DO PERFIL */}
      <aside className={styles.sidebar}>
        <div className={styles.avatarHeader}>
          <div className={styles.avatarWrapper}>
            <Image
              src={formData.photoUrl}
              alt="Avatar do Usuário"
              width={96}
              height={96}
              className={styles.avatarLarge}
              unoptimized
            />
          </div>
          <h3 className={styles.profileName}>{formData.name || 'Usuário'}</h3>
          <p className={styles.profileEmail}>{formData.email}</p>
        </div>

        <nav className={styles.nav}>
          <button
            type="button"
            className={`${styles.navBtn} ${activeTab === 'dados' ? styles.navBtnActive : ''}`}
            onClick={() => setActiveTab('dados')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Dados Pessoais
          </button>

          <button
            type="button"
            className={`${styles.navBtn} ${activeTab === 'seguranca' ? styles.navBtnActive : ''}`}
            onClick={() => setActiveTab('seguranca')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Segurança
          </button>

          <button
            type="button"
            className={`${styles.navBtn} ${activeTab === 'pagamento' ? styles.navBtnActive : ''}`}
            onClick={() => setActiveTab('pagamento')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Pagamentos (Mock)
          </button>

          <button
            type="button"
            className={`${styles.navBtn} ${activeTab === 'preferencias' ? styles.navBtnActive : ''}`}
            onClick={() => setActiveTab('preferencias')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Preferências
          </button>
        </nav>
      </aside>

      {/* CONTEÚDO DA ABA ATIVA */}
      <main className={styles.content}>
        {message && (
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            {message}
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* ABA: DADOS PESSOAIS */}
        {activeTab === 'dados' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Dados Pessoais</h2>
            <p className={styles.panelSubtitle}>Atualize suas informações cadastrais e escolha seu avatar preferido.</p>

            <div className={styles.avatarSection}>
              <span className={styles.sectionLabel}>Escolha seu Avatar</span>
              <div className={styles.avatarGrid}>
                {AVATARS.map((avatar) => (
                  <Image
                    key={avatar}
                    src={avatar}
                    alt="Opção de avatar"
                    width={64}
                    height={64}
                    className={`${styles.avatarOption} ${formData.photoUrl === avatar ? styles.avatarOptionSelected : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, photoUrl: avatar }))}
                    unoptimized
                  />
                ))}
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Nome Completo</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input
                    type="text"
                    name="name"
                    className={styles.inputField}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>E-mail</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input
                    type="email"
                    name="email"
                    className={styles.inputField}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Cidade Padrão</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <input
                    type="text"
                    name="city"
                    className={styles.inputField}
                    placeholder="Ex: Campina Grande, Recife, João Pessoa"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Telefone / WhatsApp</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <input
                    type="tel"
                    name="phone"
                    className={styles.inputField}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(83) 99999-9999"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: SEGURANÇA */}
        {activeTab === 'seguranca' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Segurança da Conta</h2>
            <p className={styles.panelSubtitle}>Para alterar sua senha de acesso, informe a senha atual e defina a nova chave.</p>

            <div className={styles.inputGroup} style={{ maxWidth: '480px' }}>
              <label>Senha Atual</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  className={`${styles.inputField} ${styles.inputFieldNoIcon}`}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label="Alternar visibilidade da senha"
                >
                  {showCurrentPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup} style={{ maxWidth: '480px' }}>
              <label>Nova Senha</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  className={`${styles.inputField} ${styles.inputFieldNoIcon}`}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label="Alternar visibilidade da nova senha"
                >
                  {showNewPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA: PAGAMENTOS (MOCK) */}
        {activeTab === 'pagamento' && (
          <div className={styles.panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className={styles.panelTitle}>Métodos de Pagamento</h2>
                <p className={styles.panelSubtitle} style={{ marginBottom: 0 }}>Gerencie seus cartões salvos para compras com 1 clique (Ambiente Simulado).</p>
              </div>
              <button type="button" onClick={addNewCard} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                + Adicionar Cartão
              </button>
            </div>

            <div className={styles.cardsList}>
              {paymentMocks.map((card, idx) => (
                <div key={idx} className={styles.creditCard}>
                  <div className={styles.creditCardTop}>
                    <div className={styles.cardChip} />
                    <div className={styles.cardBrand}>ELITE VISA</div>
                  </div>

                  <div className={styles.cardNumber}>{card.cardNumber}</div>

                  <div className={styles.creditCardBottom}>
                    <div>
                      <div className={styles.cardHolderLabel}>Titular</div>
                      <div className={styles.cardHolderName}>{card.name}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div className={styles.cardHolderLabel}>Expira em</div>
                      <div className={styles.cardExpiry}>{card.expiry}</div>
                    </div>

                    <div className={styles.cardActions}>
                      <span className={`${styles.statusBadge} ${card.status === 'approved' ? styles.statusApproved : styles.statusDeclined}`}>
                        {card.status === 'approved' ? 'Aprovado' : 'Recusado'}
                      </span>
                      <button
                        type="button"
                        className={styles.removeCardBtn}
                        onClick={() => setPaymentMocks((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: PREFERÊNCIAS */}
        {activeTab === 'preferencias' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Preferências de Notificação</h2>
            <p className={styles.panelSubtitle}>Configure como deseja receber novidades, descontos e alertas de ingressos.</p>

            <div className={styles.prefList}>
              <div className={styles.prefItem}>
                <div className={styles.prefInfo}>
                  <div className={styles.prefTitle}>Newsletter e Ofertas Exclusivas</div>
                  <div className={styles.prefDesc}>Receba e-mails com estreias de filmes, pré-venda de shows e cupons de desconto.</div>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={preferences.newsletter}
                    onChange={(e) => setPreferences((prev) => ({ ...prev, newsletter: e.target.checked }))}
                  />
                  <span className={styles.slider} />
                </label>
              </div>

              <div className={styles.prefItem}>
                <div className={styles.prefInfo}>
                  <div className={styles.prefTitle}>Confirmações e Alertas via SMS</div>
                  <div className={styles.prefDesc}>Receba notificações de confirmação de compra e lembretes de sessão no seu celular.</div>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={preferences.sms}
                    onChange={(e) => setPreferences((prev) => ({ ...prev, sms: e.target.checked }))}
                  />
                  <span className={styles.slider} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* BARRA DE AÇÕES (SALVAR) */}
        <div className={styles.saveBar}>
          <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
