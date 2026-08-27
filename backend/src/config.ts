/**
 * Configuração centralizada com fail-fast.
 * O servidor NÃO inicia se variáveis obrigatórias estiverem ausentes.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ FATAL: Variável de ambiente "${name}" não definida. O servidor não pode iniciar.`);
    process.exit(1);
  }
  return value;
}

export const config = {
  /** Secret para tokens de sessão (login/autenticação) */
  jwtAuthSecret: requireEnv('JWT_AUTH_SECRET'),
  /** Secret separado para assinatura de QR Code de ingressos */
  jwtTicketSecret: requireEnv('JWT_TICKET_SECRET'),
  /** Porta do servidor HTTP */
  port: parseInt(process.env.PORT || '3333', 10),
};
