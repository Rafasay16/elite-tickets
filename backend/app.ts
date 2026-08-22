import express from 'express';
import cors from 'cors';
import routes from './src/routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware para logs das requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api', routes);

export default app;
