import React from 'react';

interface RatingBadgeProps {
  rating: string;
}

export default function RatingBadge({ rating }: RatingBadgeProps) {
  let bgColor = '#059669'; // Livre - Verde
  let label = 'L';

  switch (rating) {
    case '10':
      bgColor = '#2563eb'; // Azul
      label = '10';
      break;
    case '12':
      bgColor = '#eab308'; // Amarelo
      label = '12';
      break;
    case '14':
      bgColor = '#ea580c'; // Laranja
      label = '14';
      break;
    case '16':
      bgColor = '#dc2626'; // Vermelho
      label = '16';
      break;
    case '18':
      bgColor = '#000000'; // Preto
      label = '18';
      break;
    case 'Livre':
    default:
      bgColor = '#059669'; // Verde
      label = 'L';
      break;
  }

  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        backgroundColor: bgColor,
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        borderRadius: '4px',
        fontFamily: 'sans-serif',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        border: rating === '18' ? '1px solid rgba(255,255,255,0.2)' : 'none'
      }}
      title={`Classificação: ${rating}`}
    >
      {label}
    </div>
  );
}
