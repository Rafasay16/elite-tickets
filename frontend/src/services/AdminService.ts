import { fetchApi } from '../lib/api';

export class AdminService {
  static async listOrganizers() {
    const res = await fetchApi(`/super-admin/organizers?_t=${Date.now()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao listar organizadores');
    return data.organizers || [];
  }

  static async createOrganizer(payload: any) {
    const res = await fetchApi('/super-admin/organizers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar organizador');
    return data.organizer;
  }

  static async resetPassword(id: string, password: string) {
    const res = await fetchApi(`/super-admin/organizers/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao alterar senha');
    return data;
  }

  static async updateConfig(id: string, payload: any) {
    const res = await fetchApi(`/super-admin/organizers/${id}/limits`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao salvar configurações');
    return data.organizer;
  }

  static async toggleStatus(id: string, isActive: boolean) {
    const res = await fetchApi(`/super-admin/organizers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao alterar status');
    return data.organizer;
  }
}
