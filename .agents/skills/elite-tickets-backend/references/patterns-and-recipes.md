# Padrões de Código e Receitas (Recipes)

Este documento contém templates práticos e padrões prontos para uso ao estender o backend do **Elite Tickets**.

---

## Receita 1: Criando uma Nova Rota com Autenticação e Validação

### 1. Schema (`src/schemas/meuSchema.ts`)
```typescript
import { z } from 'zod';

export const meuSchema = {
  criarItem: z.object({
    body: z.object({
      nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
      quantidade: z.number().int().positive('Quantidade deve ser positiva'),
      preco: z.number().or(z.string().transform(Number)),
      ativo: z.boolean().optional().default(true)
    })
  }),
  buscarPorId: z.object({
    params: z.object({
      id: z.string().uuid('ID inválido')
    })
  })
};
```

### 2. Service (`src/services/MeuService.ts`)
```typescript
import prisma from '../models/prisma';

export class MeuService {
  static async criar(data: any, userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    const item = await prisma.item.create({
      data: {
        nome: data.nome,
        quantidade: parseInt(data.quantidade),
        preco: parseFloat(data.preco),
        ativo: data.ativo ?? true,
        userId
      }
    });

    return item;
  }

  static async buscarPorId(id: string) {
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) throw new Error('Item não encontrado');
    return item;
  }
}
```

### 3. Controller (`src/controllers/MeuController.ts`)
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MeuService } from '../services/MeuService';

export class MeuController {
  static async criar(req: AuthRequest, res: Response) {
    try {
      const item = await MeuService.criar(req.body, req.user.id);
      return res.status(201).json({ success: true, item });
    } catch (error: any) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async buscarPorId(req: AuthRequest, res: Response) {
    try {
      const item = await MeuService.buscarPorId(req.params.id as string);
      return res.json({ item });
    } catch (error: any) {
      if (error.message === 'Item não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
```

### 4. Router (`src/routes/meuRoutes.ts`)
```typescript
import { Router } from 'express';
import { MeuController } from '../controllers/MeuController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { meuSchema } from '../schemas/meuSchema';

const router = Router();

// Todas as rotas deste módulo requerem autenticação
router.use(authMiddleware);

// Rota restrita a ORGANIZER e SUPER_ADMIN
router.post(
  '/',
  roleMiddleware(['ORGANIZER', 'SUPER_ADMIN']),
  validate(meuSchema.criarItem),
  MeuController.criar
);

// Rota com validação de parâmetros
router.get(
  '/:id',
  validate(meuSchema.buscarPorId),
  MeuController.buscarPorId
);

export default router;
```

---

## Receita 2: Geração de QR Code Criptografado e Assinado

```typescript
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

export class TicketSecurity {
  static async generateSignedQRCode(payloadData: Record<string, any>): Promise<string> {
    const secret = process.env.JWT_SECRET || 'fallback_secret_123';
    
    // Assina payload com timestamp
    const token = jwt.sign(
      { ...payloadData, timestamp: Date.now() },
      secret
    );

    // Gera imagem base64 DataURL do QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(token);
    return qrCodeDataUrl;
  }
}
```

---

## Receita 3: Inserção em Lote (Chunking para evitar limites do PostgreSQL)

```typescript
// Padrão de inserção em lote para milhares de registros
const CHUNK_SIZE = 5000;
for (let i = 0; i < itensGrandes.length; i += CHUNK_SIZE) {
  const chunk = itensGrandes.slice(i, i + CHUNK_SIZE);
  await prisma.seat.createMany({ data: chunk });
}
```
