# Guia Arquitetural Detalhado do Backend

Este documento aprofunda os princípios, fluxo de dados e convenções técnicas adotadas no backend do **Elite Tickets**.

---

## 1. Princípios Arquiteturais

1. **Separação Rígida de Responsabilidades (SoC)**:
   - **Routes**: Apenas definem caminhos HTTP, associam middlewares e encaminham para o controller correspondente.
   - **Middlewares**: Tratam aspectos transversais (autenticação JWT, autorização RBAC, validação de payload). Não executam regras de negócio.
   - **Controllers**: Extraem dados do `req`, chamam a camada de serviço e traduzem o resultado ou exceções em respostas HTTP padronizadas.
   - **Services**: Contêm 100% das regras de negócio, cálculos, chamadas de integração (TMDB, QRCode) e persistência via Prisma.
   - **Prisma Models**: Definem a estrutura relacional e integridade de dados no PostgreSQL.

2. **Segurança por Padrão (Security by Default)**:
   - Todas as rotas administrativas, de organizador ou portaria exigem autenticação obrigatória via `authMiddleware` e verificação de cargo via `roleMiddleware`.
   - Hashing com `bcrypt` (fator de custo 10) antes de qualquer persistência de senha.
   - Higienização: exclusão estrita de campos sensíveis (como `password`) antes de retornar dados do usuário.

3. **Consistência e Prevenção de Conflitos**:
   - Constraints de unicidade compostas no banco (ex: `@@unique([eventId, row, number])`) para impedir venda em duplicidade de assentos (*double-booking*).
   - Bloqueio de excesso de ingressos por usuário via verificação em nível de serviço (`maxTicketsPerUser`).
   - Bloqueio de limite de eventos por organizador (`eventLimit`).

---

## 2. Fluxo de Execução de uma Requisição

```text
1. Cliente envia HTTP Request (ex: POST /api/events)
2. app.ts executa log da requisição e envia para /api (routes/index.ts)
3. routes/eventRoutes.ts executa:
   ├── authMiddleware (Valida JWT no header Authorization -> anexa req.user)
   ├── roleMiddleware(['ORGANIZER']) (Valida se req.user.role tem permissão)
   └── validate(eventSchema.create) (Valida req.body contra schema Zod)
4. EventController.create(req, res):
   └── Chama EventService.create(req.body, req.user.id)
5. EventService.create:
   ├── Verifica limite de eventos do organizador no banco
   ├── Consulta classificação indicativa se houver TMDB externalId
   ├── Cria o registro do Evento no Prisma
   ├── Gera a malha de assentos (Seat[]) em chunks de 5000
   └── Retorna o evento criado
6. EventController responde status 200/201 JSON com { success: true, event }
```

---

## 3. Padrão de Tratamento de Erros e Códigos HTTP

Os controllers devem mapear erros lançados pelos services para códigos de status HTTP claros:

| Cenário de Erro | Status HTTP | Exemplo de Mensagem |
| :--- | :--- | :--- |
| Validação Zod falhou | `400 Bad Request` | `Erro de validação` com array `details` |
| Regra de negócio violada | `400 Bad Request` | `"Assento indisponível"`, `"Limite de ingressos atingido"` |
| Credenciais inválidas / Sem token | `401 Unauthorized` | `"Token não fornecido"`, `"Credenciais inválidas"` |
| Permissão insuficiente / Conta suspensa | `403 Forbidden` | `"Acesso Negado"`, `"Conta de organizador inativa"` |
| Registro não encontrado | `404 Not Found` | `"Evento não encontrado"`, `"Reserva não encontrada"` |
| Erro não tratado / Banco indisponível | `500 Internal Server Error` | Erro genérico ou `error.message` |
