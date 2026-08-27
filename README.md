# Elite Tickets

Uma plataforma full-stack de bilhetagem de eventos, reserva interativa de assentos e controle de acesso digital com validacao de ingressos via QR Code em tempo real, paineis administrativos de inteligencia de negocios e interface moderna.

## Demonstracao Online em Producao

- Plataforma Frontend: https://elite-tickets-vlr.vercel.app/
- API Backend: https://elite-tickets-api-uiqi.onrender.com

---

## 1. Processo de Engenharia: Uso de Ferramentas de IA e Contribuicao Humana

Em conformidade com as diretrizes do projeto, esta secao detalha a distribuicao entre o uso assistido de ferramentas de Inteligencia Artificial e a atuacao direta do desenvolvedor na arquitetura, modelagem de dados, organizacao estrutural e tomadas de decisao tecnica.

### Ferramentas de IA Utilizadas

- **Claude Code (Opus):**
  - Utilizado como acelerador de codigo para scaffolding de rotas REST, prototipagem inicial de schemas de validacao Zod, mapeamento base de tipos TypeScript e geracao de esqueletos para operacoes CRUD.
- **Gemini 3.7 Flash (High Thinking / Raciocinio Avancado):**
  - Utilizado na analise de gargalos de performance, refatoracao de regras de sessao e sincronizacao de cookies de autenticacao, algoritmo de agrupamento de sessoes de cinema por data, logica de busca instantanea com normalizacao de texto (remocao de acentos) e auxilio no diagnostico de bugs de renderizacao do motor WebKit no iOS Safari.
- **Impeccable (Suite de Auditoria e Critica Heuristica de Frontend):**
  - Utilizado como ferramenta de apoio e checklist de design para auditoria visual de contraste, ritmos espaciais, ergonomia de toque em telas menores (320px a 768px), estados vazios (empty states) e consistencia na transicao entre temas claro e escuro.

### O Que Foi Concebido, Arquitetado e Implementado Manualmente (Trabalho Humano e Engenharia)

- **Arquitetura de Software e Organizacao Modular de Diretorios:**
  - Planejamento e estruturacao completa do monorepo separando estritamente as responsabilidades do frontend e backend:
    - **Backend em Camadas:** Divisao rigorosa em Controllers (recebimento e resposta HTTP), Services (regras de negocio puras), Middlewares (autenticacao e RBAC), Schemas (validacao de payload) e Database (Prisma ORM e migracoes).
    - **Frontend Desacoplado (Next.js 14 App Router):** Separacao entre Server Components (para busca de dados no servidor e otimizacao de SEO) e Client Components (`*Client.tsx` para interatividade), isolando servicos de API (`src/services/`), utilitarios de formatacao e mascaras (`src/utils/`), e componentes atomicos reutilizaveis (`src/components/`).
- **Modelagem Relacional de Banco de Dados e Consistencia Transacional:**
  - Desenho do modelo de dados relacional no PostgreSQL (Entidades: User, Event, Seat, Reservation, Ticket, PaymentMethod).
  - Preços monetários modelados com precisão inteira em centavos (`priceInCents Int`), eliminando problemas de arredondamento de Float.
  - Tabela dedicada `Ticket` para dados criptográficos de validação, desacoplada da entidade `Reservation`.
  - Transações atômicas com locks condicionais (`prisma.$transaction` e `updateMany` condicional `WHERE status = 'AVAILABLE'` e `WHERE status = 'PAID'`), garantindo matematicamente no banco a impossibilidade de venda duplicada (*double-booking*) e validação duplicada (*double-scan*) em cenários de alta concorrência.
- **Segurança, Autenticacao e Governanca RBAC em 4 Niveis:**
  - Segregação estrita de segredos criptográficos com inicialização *Fail-Fast* (`JWT_AUTH_SECRET` para sessões e `JWT_TICKET_SECRET` para assinatura de QR Codes; o servidor recusa o boot caso as variáveis estejam ausentes).
  - Assinatura criptográfica HMAC não-forjável com verificação obrigatória (`jwt.verify`), sem fallbacks inseguros ou busca por prefixo (busca estrita por igualdade exata de ID).
  - Proteção de dados pessoais (LGPD/Privacy by Design): payload do QR Code é 100% opaco e não trafega dados pessoais (`customerName`/`guestName`), sendo os dados do titular resolvidos exclusivamente no servidor após a verificação criptográfica.
  - Modelagem do sistema de autorizacao por papeis (`CLIENT`, `ORGANIZER`, `PORTARIA`, `SUPER_ADMIN`), assegurando que produtores nao acessem eventos concorrentes e que operadores de portaria tenham acesso exclusivo e seguro ao HUD de leitura.
  - Implementacao de politicas de hashing criptografico com Bcrypt (salt 10) e higienizacao de dados sensiveis (remocao de senhas antes do envio das respostas HTTP).
- **Design System Tokenizado e Arquitetura CSS Proprietaria:**
  - Desenvolvimento manual de um design system proprietario via CSS Modules e variaveis CSS puras (`globals.css`), sem dependencia de frameworks utilitarios inflados (como Tailwind). A arquitetura foi concebida para suportar Glassmorphism, degradês calculados e troca instantanea entre Dark Mode e Light Mode atraves de atributos semanticos (`[data-theme='light']`).
- **Estrategia de Infraestrutura, Deploy e CI/CD:**
  - Escolha e configuracao dos ambientes de hospedagem: Vercel para o frontend em arquitetura Edge/Serverless, Render para o servico de API Express em container Node.js, e Supabase para o cluster gerenciado de PostgreSQL com connection pooling.
- **Depuracao em Dispositivos Fisicos Reais:**
  - Testes manuais e depuracao em smartphones fisicos (iPhone/Safari e Android/Chrome), identificando comportamentos especificos de motores de renderizacao movel, como o problema de corte de elementos fixos dentro de containers com `backdrop-filter` no WebKit do iOS Safari, solucionado com a implementacao de `createPortal`.
- **Concepcao Criativa das Funcionalidades de Valor Agregado:**
  - Idealizacao humana de todas as funcionalidades de produto comercial: feedback auditivo sintetizado na portaria via Web Audio API, compartilhamento inteligente por WhatsApp Web Share API, busca automatica de enderecos por CEP (ViaCEP), integracao de geolocalizacao com dados oficiais do IBGE e gerador de senhas seguras com copia rapida.

---

## 2. Iniciativas e Diferenciais de Criatividade (Alem do Escopo Basico)

Abaixo estao as funcionalidades implementadas por iniciativa propria para tornar a plataforma um produto de nivel comercial:

1. **Sintetizador Sonoro Nativo na Portaria (Web Audio API):**
   - Em vez de depender apenas de alertas visuais, a tela da portaria conta com sintetizador de frequencias sonoras que emite um acorde harmonico em caso de ingresso valido e um sinal sonoro dissonante para ingressos duplicados ou invalidos, acelerando o fluxo de filas.
2. **QR Code Integrado no Canhoto do Ingresso com Modal de Ampliacao:**
   - O QR Code fica diretamente visivel no corpo do ingresso digital, eliminando cliques extras na entrada do evento. Inclui botao de ampliacao em tela cheia para leitura facil em condicoes de luz solar ou telas riscadas.
3. **Geolocalizacao Automatica e Integracao com a API do IBGE:**
   - O usuario pode identificar sua localizacao via GPS (Reverse Geocoding) ou selecionar seu estado e municipio por meio da base oficial do IBGE, filtrando eventos da sua regiao.
4. **Preenchimento Automatico de Endereco por CEP (ViaCEP):**
   - No painel administrativo do organizador, a digitacao do CEP do local preenche automaticamente os campos de logradouro, bairro, cidade e estado.
5. **Governanca de Super Administrador com Geracao Segura de Senhas:**
   - O Super Admin pode parametrizar taxas de conveniencia individualizadas por produtor, limitar cotas de publicacao de eventos e gerar senhas temporarias com botao de copia imediata para a area de transferencia.
6. **Alternador de Tema Claro e Escuro (Dark e Light Mode):**
   - Suporte completo a alternancia de tema com persistencia no navegador e tokens semanticos que garantem legibilidade e contraste em todas as telas.
7. **Menu Mobile Adaptativo via React Portal:**
   - Desenvolvido especificamente para evitar o problema classico do Safari/WebKit em que elementos fixos ficam cortados dentro de headers com efeito de desfoque (backdrop-filter).

---

## 3. Tecnologias Utilizadas

### Frontend
- Framework: Next.js 14 (App Router)
- Linguagem: TypeScript (Strict Typechecking)
- Estilizacao: CSS Modules com variaveis e tokens semanticos
- Icones: Icones vetoriais SVG customizados
- Otimizacao de Imagens: Componente Image do Next.js integrado ao TMDB e DiceBear
- Recursos Web: Web Audio API, Web Share API, Geolocation API, HTML5 Canvas QR

### Backend
- Ambiente de Execucao: Node.js
- Framework: Express
- Linguagem: TypeScript (Tipagem estrita, interfaces de domínio dedicadas, sem `any`)
- ORM: Prisma
- Banco de Dados: PostgreSQL (Supabase)
- Criptografia e Autenticação: JWT com fail-fast e segregação de chaves, Bcrypt (salt 10)
- Testes Automatizados: Vitest (com suítes de concorrência, segurança de ingressos e autenticação)

### Infraestrutura e Hospedagem
- Frontend: Vercel
- Backend: Render
- Banco de Dados: Supabase

---

## 4. Estrutura de Papeis e Permissoes (RBAC)

- **CLIENT:** Acessa o catalogo de eventos, realiza busca e filtros, seleciona assentos, efetua reservas, visualiza e compartilha ingressos na carteira digital e edita seu perfil.
- **ORGANIZER:** Cria e gerencia eventos, acompanha indicadores (total de eventos, capacidade e ingressos vendidos), emite cortesias VIP e cadastra equipes de portaria.
- **PORTARIA:** Interface simplificada e segura para leitura de ingressos via camera ou digitacao manual, com feedback sonoro e auditoria de entradas em tempo real.
- **SUPER_ADMIN:** Painel de governanca global da plataforma, permitindo cadastrar produtores, definir taxas de servico customizadas, pausar contas e redefinir credenciais.

---

## 5. Instrucoes de Instalacao, Execucao Local e Testes

### Pre-requisitos
- Node.js (versao 18.0.0 ou superior)
- Gerenciador de pacotes npm

### Passo a Passo

1. Clonar o repositorio e instalar as dependencias:
```bash
git clone https://github.com/Rafasay16/elite-tickets.git
cd elite-tickets
npm install
npm run install:all
```

2. Configurar as variaveis de ambiente:

Arquivo `backend/.env`:
```env
PORT=3333
DATABASE_URL="postgresql://usuario:senha@host:porta/banco?pgbouncer=true"
DIRECT_URL="postgresql://usuario:senha@host:porta/banco"
JWT_AUTH_SECRET="chave_secreta_para_tokens_de_sessao"
JWT_TICKET_SECRET="chave_secreta_para_assinatura_de_ingressos_qr"
TMDB_API_KEY="chave_opcional_tmdb"
TICKETMASTER_API_KEY="chave_opcional_ticketmaster"
```

Arquivo `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3333/api"
```

3. Inicializar e popular o banco de dados:
```bash
cd backend
npx prisma generate
npx prisma db push
npx tsx scripts/seed.ts
cd ..
```

4. Executar os testes automatizados (Backend):
```bash
cd backend
npm test
cd ..
```

5. Executar os servidores de desenvolvimento simultaneamente:
```bash
npm run dev
```

- A aplicacao web estara acessivel em: `http://localhost:3000`
- A API backend estara acessivel em: `http://localhost:3333`

---

## 6. Cobertura de Testes Automatizados (Vitest)

O backend conta com suítes de testes automatizados cobrindo os fluxos críticos de negócio:

1. **`tests/concurrency.test.ts`**:
   - **Garantia Anti-Double-Booking**: Dispara 3 requisições simultâneas para o mesmo assento via `Promise.allSettled`; valida que exatamente 1 tem sucesso e as demais falham com conflito.
   - **Garantia Anti-Double-Scan**: Dispara leituras simultâneas do mesmo QR Code; valida que apenas a primeira é liberada e a segunda é rejeitada com `JÁ UTILIZADO`.
2. **`tests/ticket_security.test.ts`**:
   - **Payload Opaco sem PII**: Inspeciona o JWT do QR Code para garantir ausência de dados pessoais (`customerName`/`guestName`).
   - **Rejeição de QR Adulterado/Forjado**: Validação obrigatória de assinatura via `jwt.verify()`.
   - **Impedimento de Ataque por Prefixo**: Rejeita identificadores UUID crus ou incompletos.
   - **Resolução Segura no Servidor**: Validação de ingresso legítimo e resolução de dados no banco.
3. **`tests/auth.test.ts`**:
   - **Segregação de Segredos**: Prova que tokens de autenticação não podem validar ingressos e vice-versa.
   - **Fluxo de Registro e Login**: Verificação de senhas com hash Bcrypt e geração de JWT.

---

## 7. Credenciais de Teste para Validacao

| Papel | E-mail | Senha | Area de Acesso |
|---|---|---|---|
| Cliente | rafinha@gmail.com | 123456 | Catalogo, Reserva, Meus Ingressos, Perfil |
| Cliente | reuel@gmail.com | 123456 | Catalogo, Reserva, Meus Ingressos, Perfil |
| Organizador | admin@admin.com | 123456 | Painel do Organizador (/admin), Portaria |
| Portaria | portaria@elite.com | 123456 | HUD Scanner da Portaria (/portaria) |
| Super Admin | superadmin@elite.com | 123456 | Governanca Global (/super-admin) |

---

## 8. Informacoes de Suporte e Solucao de Problemas (Troubleshooting)

Caso encontre algum comportamento inesperado durante a execucao ou teste:

1. **Tempo de Resposta na Primeira Requisicao da API (Cold Start no Render):**
   - O backend em producao esta hospedado no tier gratuito do Render. Caso fique inativo por alguns minutos, o primeiro carregamento de dados pode levar cerca de 30 a 50 segundos para inicializar a instancia. Apos o primeiro acesso, as respostas ocorrem normalmente em milissegundos.
2. **Permissao de Camera no Scanner da Portaria:**
   - Os navegadores modernos exigem conexao segura (HTTPS ou localhost) para conceder acesso a camera. Ao testar o leitor da portaria em dispositivos moveis, certifique-se de autorizar a permissao de camera quando solicitada pelo navegador. Caso a camera nao esteja disponivel, a aba de **Digitacao Manual** permite validar ingressos digitando o identificador do ticket.
3. **Troca de Tema e Armazenamento Local:**
   - A preferencia de tema claro/escuro e persistida no `localStorage`. Caso a alternancia pareca nao responder ao trocar de navegador, limpe o cache de dados do site ou abra em modo anonimo.
4. **Validacao de Build de Producao:**
   - Ambos os pacotes foram validados com compilacao de producao sem erros de tipagem TypeScript:
   ```bash
   npm run build --prefix frontend
   npm run build --prefix backend
   ```
