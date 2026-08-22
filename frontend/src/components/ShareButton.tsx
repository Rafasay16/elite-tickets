'use client';

export default function ShareButton({ qrCode, disabled }: { qrCode: string, disabled?: boolean }) {
  const handleShare = () => {
    if (disabled) return;
    const link = `${window.location.origin}/ingresso/${qrCode}`;
    navigator.clipboard.writeText(link);
    alert('Link do ingresso copiado para a área de transferência!');
  };

  return (
    <button 
      className="btn btn-secondary" 
      style={{ width: '100%', marginTop: '1rem', fontSize: '0.8rem', padding: '0.5rem', opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      onClick={handleShare}
      disabled={disabled}
    >
      Compartilhar Link
    </button>
  );
}
