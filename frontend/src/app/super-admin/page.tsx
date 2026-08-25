'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminService } from '@/services/AdminService';
import { maskCPF, maskCNPJ, maskInteger } from '@/utils/masks';
import styles from './SuperAdmin.module.css';

type Organizer = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  feeRate: number;
  eventLimit: number;
};

export default function SuperAdminPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // Modal Novo Organizador
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [creating, setCreating] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Form Configuração Modal
  const [editingOrg, setEditingOrg] = useState<Organizer | null>(null);
  const [feeRate, setFeeRate] = useState(0.15);
  const [eventLimit, setEventLimit] = useState(5);
  const [newPassword, setNewPassword] = useState('');

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const fetchOrganizers = useCallback(async () => {
    try {
      const data = await AdminService.listOrganizers();
      setOrganizers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  // Global keydown for Escape dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreatingModalOpen(false);
        setEditingOrg(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setGeneratedPassword('');
    setCopied(false);

    // Gerar senha temporária de 6 caracteres alfanuméricos
    const randomPassword = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      await AdminService.createOrganizer({ name, email, password: randomPassword, cpf, cnpj, responsavel });
      setName('');
      setEmail('');
      setCpf('');
      setCnpj('');
      setResponsavel('');
      setGeneratedPassword(randomPassword);
      showToast('Produtora cadastrada com sucesso!', 'success');
      fetchOrganizers();
    } catch (err: any) {
      showToast(err.message || 'Erro ao cadastrar produtora', 'error');
    }
    setCreating(false);
  };

  const handleCopyPassword = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const fecharModalNovo = () => {
    setIsCreatingModalOpen(false);
    setGeneratedPassword('');
    setCopied(false);
    setName('');
    setEmail('');
    setCpf('');
    setCnpj('');
    setResponsavel('');
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    try {
      await AdminService.updateConfig(editingOrg.id, { feeRate, eventLimit, password: newPassword });
      showToast('Configurações comerciais atualizadas!', 'success');
      setEditingOrg(null);
      setNewPassword('');
      fetchOrganizers();
    } catch (e) {
      showToast('Erro ao atualizar configurações', 'error');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const actionName = currentStatus ? 'suspender' : 'ativar';
    if (!confirm(`Deseja realmente ${actionName} esta produtora na plataforma?`)) return;
    try {
      await AdminService.toggleStatus(id, !currentStatus);
      showToast(`Produtora ${currentStatus ? 'suspensa' : 'ativada'} com sucesso!`, 'success');
      fetchOrganizers();
    } catch (e) {
      showToast('Erro ao alterar status', 'error');
    }
  };

  // KPIs Calculations
  const totalActive = useMemo(() => organizers.filter((o) => o.isActive).length, [organizers]);
  const totalSuspended = useMemo(() => organizers.filter((o) => !o.isActive).length, [organizers]);
  const avgFeeRate = useMemo(() => {
    if (organizers.length === 0) return '15%';
    const total = organizers.reduce((acc, curr) => acc + (curr.feeRate || 0.15), 0);
    return `${Math.round((total / organizers.length) * 100)}%`;
  }, [organizers]);

  const filteredOrganizers = useMemo(() => {
    return organizers.filter((org) => {
      let matchesSearch = true;
      let matchesStatus = true;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch = org.name.toLowerCase().includes(q) || org.email.toLowerCase().includes(q);
      }

      if (statusFilter === 'ACTIVE') matchesStatus = org.isActive;
      if (statusFilter === 'SUSPENDED') matchesStatus = !org.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [organizers, searchQuery, statusFilter]);

  return (
    <main className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem', maxWidth: '1200px' }}>
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div 
          style={{ 
            position: 'fixed', 
            top: '5.5rem', 
            right: '2rem', 
            zIndex: 1100, 
            padding: '0.85rem 1.4rem', 
            borderRadius: '12px', 
            background: toastMessage.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            backdropFilter: 'blur(8px)'
          }}
        >
          {toastMessage.text}
        </div>
      )}

      {/* HEADER DO SUPER ADMIN */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            Painel <span className="text-gradient">Super Admin</span>
          </h1>
          <p className={styles.subtitle}>
            Governança de produtoras parceiras, parametrização de taxas comerciais e cotas de eventos.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsCreatingModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem' }}
        >
          <span>+</span> Nova Produtora
        </button>
      </div>

      {/* CARDS DE KPIS DE GOVERNANÇA */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total de Produtoras</span>
            <span className={styles.kpiValue}>{organizers.length}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconGreen}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Produtoras Ativas</span>
            <span className={styles.kpiValue}>{totalActive}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconPurple}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Taxa Média Plataforma</span>
            <span className={styles.kpiValue}>{avgFeeRate}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconRed}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Contas Suspensas</span>
            <span className={styles.kpiValue}>{totalSuspended}</span>
          </div>
        </div>
      </div>

      {/* BARRA DE CONTROLE & BUSCA */}
      <div className={styles.controlBar}>
        <div className={styles.searchGroup}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por produtora ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.statusFilterGroup}>
            <button
              type="button"
              className={`${styles.statusFilterBtn} ${statusFilter === 'ALL' ? styles.statusFilterBtnActive : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              Todas
            </button>
            <button
              type="button"
              className={`${styles.statusFilterBtn} ${statusFilter === 'ACTIVE' ? styles.statusFilterBtnActive : ''}`}
              onClick={() => setStatusFilter('ACTIVE')}
            >
              Ativas ({totalActive})
            </button>
            <button
              type="button"
              className={`${styles.statusFilterBtn} ${statusFilter === 'SUSPENDED' ? styles.statusFilterBtnActive : ''}`}
              onClick={() => setStatusFilter('SUSPENDED')}
            >
              Suspensas ({totalSuspended})
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Exibindo <strong style={{ color: 'var(--text-primary)' }}>{filteredOrganizers.length}</strong> de {organizers.length} produtoras
        </div>
      </div>

      {/* TABELA DE PRODUTORAS */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <p className="text-secondary">Carregando parceiros cadastrados...</p>
          </div>
        ) : filteredOrganizers.length === 0 ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading-family)', margin: '0 0 0.5rem 0' }}>Nenhuma produtora encontrada</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
              Não encontramos parceiros que correspondam aos filtros de busca atuais.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Produtora</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Taxa Plataforma</th>
                <th className={styles.th}>Cota de Eventos</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Ações de Gestão</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizers.map((org) => (
                <tr key={org.id} className={styles.tr}>
                  <td className={styles.td}>
                    <span className={styles.orgName}>{org.name}</span>
                    <span className={styles.orgEmail}>{org.email}</span>
                  </td>

                  <td className={styles.td}>
                    <span className={`${styles.statusBadge} ${org.isActive ? styles.statusActive : styles.statusSuspended}`}>
                      {org.isActive ? 'Ativo' : 'Suspenso'}
                    </span>
                  </td>

                  <td className={styles.td}>
                    <span className={styles.feeRateBadge}>
                      {Math.round((org.feeRate || 0.15) * 100)}%
                    </span>
                  </td>

                  <td className={styles.td}>
                    <span className={styles.quotaBadge}>
                      {org.eventLimit || 5} eventos
                    </span>
                  </td>

                  <td className={styles.td}>
                    <div className={styles.actionsCell}>
                      <button
                        type="button"
                        className={styles.configBtn}
                        onClick={() => {
                          setEditingOrg(org);
                          setFeeRate(org.feeRate || 0.15);
                          setEventLimit(org.eventLimit || 5);
                          setNewPassword('');
                        }}
                        title="Configurações Comerciais"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                        Regras
                      </button>

                      <button
                        type="button"
                        className={`${styles.toggleStatusBtn} ${org.isActive ? styles.toggleStatusBtnSuspend : styles.toggleStatusBtnActivate}`}
                        onClick={() => handleToggleStatus(org.id, org.isActive)}
                      >
                        {org.isActive ? 'Suspender' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL: NOVO ORGANIZADOR */}
      {isCreatingModalOpen && (
        <div className={styles.modalBackdrop} onClick={fecharModalNovo}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Cadastrar Produtora</h3>
              <button type="button" className={styles.closeBtn} onClick={fecharModalNovo}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Nome da Produtora / Empresa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Arena Shows & Eventos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Nome do Responsável Legal
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do diretor/responsável"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    CPF do Responsável
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    CNPJ (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  E-mail de Acesso ao Painel Admin
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@produtora.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                />
              </div>

              {!generatedPassword && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                  style={{ marginTop: '0.5rem', padding: '0.85rem' }}
                >
                  {creating ? 'Cadastrando Produtora...' : 'Cadastrar Produtora'}
                </button>
              )}
            </form>

            {/* SENHA TEMPORÁRIA GERADA COM BOTÃO COPIAR */}
            {generatedPassword && (
              <div className={styles.passwordResultCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.95rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Produtora criada com sucesso!
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0 0' }}>
                  Envie a senha temporária abaixo para o responsável acessar o painel:
                </p>

                <div className={styles.passwordBox}>
                  <span className={styles.passwordText}>{generatedPassword}</span>
                  <button type="button" className={styles.copyBtn} onClick={handleCopyPassword}>
                    {copied ? 'Copiado!' : 'Copiar Senha'}
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={fecharModalNovo}
                  style={{ width: '100%', marginTop: '1.25rem', padding: '0.65rem' }}
                >
                  Concluir e Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURAÇÕES COMERCIAIS */}
      {editingOrg && (
        <div className={styles.modalBackdrop} onClick={() => { setEditingOrg(null); setNewPassword(''); }}>
          <div className={styles.modalContent} style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Regras Comerciais</h3>
                <span style={{ fontSize: '0.825rem', color: 'var(--accent-neon)', fontWeight: 600 }}>{editingOrg.name}</span>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => { setEditingOrg(null); setNewPassword(''); }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Taxa de Serviço da Plataforma (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    required
                    value={Math.round(feeRate * 100)}
                    onChange={(e) => {
                      const val = Number(maskInteger(e.target.value));
                      if (val <= 100) setFeeRate(val / 100);
                    }}
                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white', fontFamily: 'var(--font-mono)' }}
                  />
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>%</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                  Percentual retido por ingresso vendido pela produtora.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Limite Máximo de Eventos Ativos
                </label>
                <input
                  type="text"
                  required
                  value={eventLimit === 0 ? '' : eventLimit}
                  onChange={(e) => setEventLimit(Number(maskInteger(e.target.value)))}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Redefinir Senha de Acesso (Opcional)
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Deixe em branco para manter a senha atual"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setEditingOrg(null);
                    setNewPassword('');
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Salvar Regras
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
