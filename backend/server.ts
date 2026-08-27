import dotenv from 'dotenv';

// dotenv DEVE ser carregado ANTES de qualquer import que use config.ts (fail-fast)
dotenv.config();

import app from './app';
import { config } from './src/config';

app.listen(config.port, () => {
  console.log(`🚀 Backend rodando na porta ${config.port}`);
});
