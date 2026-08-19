'use client';

export default function ShareButton({ qrCode }: { qrCode: string }) {
  const handleShare = () => {
    const link = `${window.location.origin}/ingresso/${qrCode}`;
    navigator.clipboard.writeText(link);
    alert('Link do ingresso copiado para a área de transferência!');
  };

  return (
    <button 
      className="btn btn-secondary" 
      style={{ width: '100%', marginTop: '1rem', fontSize: '0.8rem', padding: '0.5rem' }}
      onClick={handleShare}
    >
      Compartilhar Link
    </button>
  );
}
