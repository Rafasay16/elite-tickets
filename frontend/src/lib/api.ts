export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token') || '';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  
  return res;
}
