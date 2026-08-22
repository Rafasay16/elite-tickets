'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminService } from '@/services/AdminService';
import { maskCPF, maskCNPJ } from '@/utils/masks';

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

  const fetchOrganizers = async () => {
    try {
      const data = await AdminService.listOrganizers();
      setOrganizers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setGeneratedPassword('');
    
    // Gerar senha aleatória de 6 caracteres alfanuméricos
    const randomPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      await AdminService.createOrganizer({ name, email, password: randomPassword, cpf, cnpj, responsavel });
      // Resetar form, menos o generatedPassword para mostrar ao usuário
      setName(''); setEmail(''); setCpf(''); setCnpj(''); setResponsavel('');
      setGeneratedPassword(randomPassword);
      fetchOrganizers();
    } catch (err: any) {
      alert(err.message);
    }
    setCreating(false);
  };

  const fecharModalNovo = () => {
    setIsCreatingModalOpen(false);
    setGeneratedPassword('');
    setName(''); setEmail(''); setCpf(''); setCnpj(''); setResponsavel('');
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    try {
      await AdminService.updateConfig(editingOrg.id, { feeRate, eventLimit, password: newPassword });
      setEditingOrg(null);
      setNewPassword('');
      fetchOrganizers();
    } catch (e) {
      alert('Erro ao atualizar configurações');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Deseja ${currentStatus ? 'suspender' : 'ativar'} este organizador?`)) return;
    try {
      await AdminService.toggleStatus(id, !currentStatus);
      fetchOrganizers();
    } catch (e) {
      alert('Erro ao alterar status');
    }
  };

  return (
    <main className="container" style={{ padding: '4rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="neon-text" style={{ marginBottom: '0.5rem' }}>Painel Super Admin</h1>
          <p className="text-secondary">Gerencie as contas dos Organizadores de Eventos da plataforma.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsCreatingModalOpen(true)}
        >
          + Novo Organizador
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          {loading ? <p>Carregando...</p> : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1rem 0' }}>Nome</th>
                  <th style={{ padding: '1rem 0' }}>E-mail</th>
                  <th style={{ padding: '1rem 0' }}>Status</th>
                  <th style={{ padding: '1rem 0', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {organizers.map(org => (
                  <tr key={org.id} style={{ borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0' }}>{org.name}</td>
                    <td style={{ padding: '1rem 0' }}>{org.email}</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem',
                        background: org.isActive ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: org.isActive ? '#34d399' : '#ef4444'
                      }}>
                        {org.isActive ? 'Ativo' : 'Suspenso'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button 
                        className="btn" 
                        style={{ color: 'var(--text-primary)', padding: '0.5rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => {
                          setEditingOrg(org);
                          setFeeRate(org.feeRate);
                          setEventLimit(org.eventLimit);
                          setNewPassword('');
                        }}
                        title="Configurações Comerciais"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleToggleStatus(org.id, org.isActive)}
                      >
                        {org.isActive ? 'Suspender' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
                {organizers.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum organizador encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      {/* Modal de Novo Organizador */}
      {isCreatingModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="neon-text">Novo Organizador</h3>
              <button onClick={fecharModalNovo} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Nome da Produtora</label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Nome do Responsável (Obrigatório)</label>
                <input 
                  type="text" required value={responsavel} onChange={e => setResponsavel(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>CPF (Obrigatório)</label>
                  <input 
                    type="text" required value={cpf} onChange={e => setCpf(maskCPF(e.target.value))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>CNPJ (Opcional)</label>
                  <input 
                    type="text" value={cnpj} onChange={e => setCnpj(maskCNPJ(e.target.value))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>E-mail de Acesso</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                />
              </div>
              
              {!generatedPassword && (
                <button type="submit" className="btn btn-primary" disabled={creating} style={{ marginTop: '0.5rem' }}>
                  {creating ? 'Criando...' : 'Cadastrar Produtora'}
                </button>
              )}
            </form>

            {generatedPassword && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '8px' }}>
                <p style={{ color: '#34d399', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Organizador criado com sucesso!</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Envie esta senha temporária para ele acessar o painel:</p>
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '2px', fontWeight: 'bold' }}>
                  {generatedPassword}
                </div>
                <button className="btn btn-secondary" onClick={fecharModalNovo} style={{ width: '100%', marginTop: '1rem' }}>
                  Concluir e Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Configuração */}
      {editingOrg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Configurar: {editingOrg.name}</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Ajuste as regras comerciais desta produtora.</p>
            
            <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Taxa de Serviço (%)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="number" step="1" min="0" max="100" required 
                    value={Math.round(feeRate * 100)} 
                    onChange={e => setFeeRate(Number(e.target.value) / 100)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                  />
                  <span>%</span>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Limite de Eventos Publicados</label>
                <input 
                  type="number" step="1" min="1" required 
                  value={eventLimit} 
                  onChange={e => setEventLimit(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Nova Senha (deixe em branco para manter a atual)</label>
                <input 
                  type="text" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setEditingOrg(null); setNewPassword(''); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
