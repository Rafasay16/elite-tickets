---
name: elite-tickets-backend
description: >-
  Guia arquitetural e runbook de desenvolvimento para o backend Node.js + Express + TypeScript + Prisma da plataforma Elite Tickets. Use esta skill ao criar novos módulos, rotas, controllers, services, schemas Zod, migrações Prisma ou ao implementar fluxos com RBAC, validação e QR Code.
---

# Elite Tickets Backend Architecture & Engineering Skill

Esta skill padroniza e orienta o desenvolvimento de novas funcionalidades, refatorações e manutenção no backend do **Elite Tickets**, seguindo a arquitetura em camadas desacopladas (Routes, Middlewares, Controllers, Services, Schemas e Database).

---

## Visão Geral da Arquitetura

O backend adota uma arquitetura em 5 camadas com separação estrita de responsabilidades:

```
Requisição HTTP
      │
      ▼
┌──────────────┐
│    Routes    │  (Express Router: mapeamento de endpoints e injeção de middlewares)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Middlewares  │  (Autenticação JWT, autorização RBAC, validação Zod)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Controllers  │  (Extração de req.body/params/query, formatação de HTTP status/erros)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Services   │  (Regras de negócio puras, integrações externas, QR Code, hashing)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Prisma / DB  │  (Singleton PrismaClient, PostgreSQL relacional, transações e índices)
└──────────────┘
```

---

## Estrutura de Diretórios Padronizada

```text
backend/
├── app.ts                  # Configuração da aplicação Express, CORS, logging e rotas /api
├── server.ts               # Inicialização do servidor HTTP e carregamento de variáveis (.env)
├── prisma/
│   ├── schema.prisma       # Modelagem relacional, constraints, enums e relações
│   └── migrations/         # Histórico versionado de migrações SQL
├── scripts/                # Scripts de seed, migração manual e automações
└── src/
    ├── models/
    │   └── prisma.ts       # Singleton do PrismaClient exportado
    ├── middleware/
    │   ├── auth.ts         # authMiddleware (JWT) e roleMiddleware (RBAC)
    │   └── validate.ts     # Validador universal baseado em Zod schemas
    ├── schemas/            # Schemas Zod de validação (body, query, params)
    ├── controllers/        # Controladores HTTP com métodos estáticos assíncronos
    ├── services/           # Camada de lógica de domínio e orquestração
    └── routes/             # Roteadores Express modulares e index.ts agregador
```

---

## Papéis de Usuário (RBAC)

O sistema opera com 4 níveis de acesso:

| Role | Descrição | Permissões Típicas |
| :--- | :--- | :--- |
| `CLIENT` | Comprador final | Listar eventos, reservar poltronas, efetuar checkout, ver ingressos |
| `ORGANIZER` | Produtor de eventos | Criar e editar eventos, emitir cortesias, gerenciar equipe de portaria |
| `PORTARIA` | Operador de acesso | Validar ingressos via QR Code/código manual e consultar histórico de leitura |
| `SUPER_ADMIN` | Gestor da plataforma | Gerenciar produtores, alterar taxas (`feeRate`), cotas (`eventLimit`) e status |

---

## Fluxo Padrão: Criação de um Novo Módulo / Feature

Ao criar qualquer nova entidade ou endpoint no backend, siga rigorosamente estes 6 passos:

### 1. Modelagem Prisma (`prisma/schema.prisma`)
- Adicione o modelo com IDs UUID (`@id @default(uuid())`), campos tipados, relações com integridade referencial e constraints necessárias (ex: `@@unique`).
- Execute a geração do cliente:
  ```bash
  npx prisma generate
  ```

### 2. Schema de Validação Zod (`src/schemas/<nome>Schema.ts`)
- Crie o objeto contendo as regras para `body`, `query` ou `params`:
```typescript
import { z } from 'zod';

export const featureSchema = {
  create: z.object({
    body: z.object({
      title: z.string().min(2, 'Título obrigatório'),
      capacity: z.number().int().positive(),
      // Suporte a conversão string -> number para payloads multipart/form
      price: z.number().or(z.string().transform(Number))
    })
  }),
  getById: z.object({
    params: z.object({
      id: z.string().uuid('ID inválido')
    })
  })
};
```

### 3. Camada de Serviço (`src/services/<Nome>Service.ts`)
- Use métodos estáticos (`static async`).
- Contenha toda a lógica de negócio, chamadas ao `prisma` e tratamentos de exceção com mensagens legíveis:
```typescript
import prisma from '../models/prisma';

export class FeatureService {
  static async create(data: any, userId: string) {
    // 1. Validações de regra de negócio
    // 2. Operação no banco
    const record = await prisma.minhaTabela.create({
      data: { ...data, userId }
    });
    return record;
  }
}
```

### 4. Camada de Controller (`src/controllers/<Nome>Controller.ts`)
- Responsável apenas por invocar o Service e retornar status HTTP apropriados:
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FeatureService } from '../services/FeatureService';

export class FeatureController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const result = await FeatureService.create(req.body, req.user.id);
      return res.status(201).json({ success: true, result });
    } catch (error: any) {
      if (error.message === 'Não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  }
}
```

### 5. Definição de Rotas (`src/routes/<nome>Routes.ts`)
- Combine os middlewares de autenticação, RBAC e validação:
```typescript
import { Router } from 'express';
import { FeatureController } from '../controllers/FeatureController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { featureSchema } from '../schemas/featureSchema';

const router = Router();

// Rota protegida com validação
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['ORGANIZER', 'SUPER_ADMIN']),
  validate(featureSchema.create),
  FeatureController.create
);

export default router;
```

### 6. Registro no Agregador (`src/routes/index.ts`)
- Registre o novo roteador sob o prefixo correspondente:
```typescript
import featureRoutes from './featureRoutes';

router.use('/features', featureRoutes);
```

---

## Padrões Essenciais de Implementação

1. **Geração e Validação de QR Code**:
   - Tickets utilizam payload assinado via JWT (`jwt.sign(payload, config.jwtTicketSecret)`) e dados opacos (sem PII como `customerName`/`guestName`).
   - Na validação de portaria (`validateTicket`), a verificação de assinatura via `jwt.verify()` é **estrita e obrigatória**. Nunca aceitar `jwt.decode` como fallback ou busca por identificador cru/prefixo.
   - O segredo de ingressos (`JWT_TICKET_SECRET`) é isolado do segredo de autenticação de sessão (`JWT_AUTH_SECRET`).
2. **Garantia de Unicidade e Concorrência Atômica**:
   - A reserva de assentos (`reserve`) e check-in na portaria (`validateTicket`) usam `prisma.$transaction` com operações condicionais atômicas (`updateMany` com `WHERE status = 'AVAILABLE'` e `WHERE status = 'PAID'`), impedindo *double-booking* e *double-scan*.
3. **Criação de Lotes (Batching)**:
   - Ao gerar assentos ou registros em massa (ex: poltronas de eventos), inserir em lotes de 5.000 para respeitar os limites de parâmetros do banco (`CHUNK_SIZE = 5000`).
4. **Higienização de Dados Sensíveis**:
   - Nunca retornar senhas nas respostas HTTP. Utilizar desestruturação:
     ```typescript
     const { password, ...safeUser } = user;
     return safeUser;
     ```
5. **Tratamento Seguro de Senhas**:
   - Sempre utilizar `bcrypt.hash(password, 10)` antes de persistir no banco.

---

## Documentação Detalhada e Referências

- [Guia Detalhado de Camadas e Padrões](./references/architecture-guide.md)
- [Receitas e Templates de Código](./references/patterns-and-recipes.md)
