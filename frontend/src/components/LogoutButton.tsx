'use client';

import { AuthService } from '@/services/AuthService';

export default function LogoutButton() {
  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/';
  };

  return (
    <button onClick={handleLogout} className="btn" style={{ marginLeft: '1rem', padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
      Sair
    </button>
  );
}
