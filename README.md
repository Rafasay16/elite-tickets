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
  - Desenho do modelo de dados relacional no PostgreSQL (Entidades: User, Event, Seat, Reservation, AuditLog).
  - Criacao manual de constraints de unicidade (`@@unique([eventId, row, number])`) e chaves estrangeiras com regras de delecao em cascata, garantindo integridade referencial no banco de dados e impedindo venda duplicada de poltronas (*double-booking*) em cenarios de alta concorrencia.
- **Seguranca, Autenticacao e Governanca RBAC em 4 Niveis:**
  - Concepcao e implementacao do fluxo de autenticacao hibrida com cookies seguros HTTP-only para Server-Side Rendering (SSR) e tokens JWT Bearer nas requisicoes de API.
  - Modelagem do sistema de autorizacao por papeis (`CLIENT`, `ORGANIZER`, `PORTARIA`, `SUPER_ADMIN`), assegurando que produtores nao acessem eventos concorrentes e que operadores de portaria tenham acesso exclusivo e seguro ao HUD de leitura.
  - Implementacao de politicas de hashing criptografico com Argon2/Bcrypt e higienizacao de dados sensiveis (remocao de senhas e dados confidenciais antes do envio das respostas HTTP).
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
- Linguagem: TypeScript
- Estilizacao: CSS Modules com variaveis e tokens semanticos
- Icones: Icones vetoriais SVG customizados
- Otimizacao de Imagens: Componente Image do Next.js integrado ao TMDB e DiceBear
- Recursos Web: Web Audio API, Web Share API, Geolocation API, HTML5 Canvas QR

### Backend
- Ambiente de Execucao: Node.js
- Framework: Express
- Linguagem: TypeScript
- ORM: Prisma
- Banco de Dados: PostgreSQL (Supabase)
- Autenticacao: JWT (JSON Web Tokens) com hash de senhas via Argon2/Bcrypt e cookies HTTP-only

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

## 5. Instrucoes de Instalacao e Execucao Local

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
JWT_SECRET="chave_secreta_jwt_de_desenvolvimento"
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
npx tsx prisma/seed.ts
cd ..
```

4. Executar os servidores de desenvolvimento simultaneamente:
```bash
npm run dev
```

- A aplicacao web estara acessivel em: `http://localhost:3000`
- A API backend estara acessivel em: `http://localhost:3333`

---

## 6. Credenciais de Teste para Validacao

| Papel | E-mail | Senha | Area de Acesso |
|---|---|---|---|
| Cliente | rafinha@gmail.com | 123456 | Catalogo, Reserva, Meus Ingressos, Perfil |
| Cliente | reuel@gmail.com | 123456 | Catalogo, Reserva, Meus Ingressos, Perfil |
| Organizador | admin@admin.com | 123456 | Painel do Organizador (/admin), Portaria |
| Portaria | portaria@elite.com | 123456 | HUD Scanner da Portaria (/portaria) |
| Super Admin | superadmin@elite.com | 123456 | Governanca Global (/super-admin) |

---

## 7. Informacoes de Suporte e Solucao de Problemas (Troubleshooting)

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

---
