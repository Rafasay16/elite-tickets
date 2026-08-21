import { fetchApi } from '../lib/api';

export class AuthService {
  static async login(email: string, password: string) {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao fazer login');

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    if (data.city) localStorage.setItem('city', data.city);
    
    document.cookie = `token=${data.token}; path=/; max-age=28800`;
    if (data.city) document.cookie = `city=${encodeURIComponent(data.city)}; path=/; max-age=28800`;
    
    return data;
  }

  static async register(name: string, email: string, password: string, city: string) {
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, city }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao fazer cadastro');

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    if (data.city) localStorage.setItem('city', data.city);
    
    document.cookie = `token=${data.token}; path=/; max-age=28800`;
    if (data.city) document.cookie = `city=${encodeURIComponent(data.city)}; path=/; max-age=28800`;
    
    return data;
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('city');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'city=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}
