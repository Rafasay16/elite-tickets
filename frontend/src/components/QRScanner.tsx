'use client';
import { useEffect } from 'react';

export default function QRScanner({ onScan }: { onScan: (code: string) => void }) {
  useEffect(() => {
    // Import dinâmico para evitar erros de SSR com o objeto window
    const { Html5QrcodeScanner } = require('html5-qrcode');
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    
    scanner.render((decodedText: string) => {
      scanner.clear(); // Parar de scanear após sucesso
      onScan(decodedText);
    }, () => {
      // ignora erros de leitura de frame vazio
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan]);

  return <div id="reader" style={{ width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', color: '#000' }}></div>;
}
