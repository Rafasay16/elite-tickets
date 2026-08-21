'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className="btn" style={{ marginLeft: '1rem', padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
      Sair
    </button>
  );
}
