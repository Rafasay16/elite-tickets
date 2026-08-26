# Elite Tickets

Uma plataforma full-stack de bilhetagem de eventos, reserva interativa de assentos e controle de acesso digital com validacao de ingressos via QR Code em tempo real, paineis administrativos de inteligencia de negocios e interface moderna.

## Demonstracao Online em Producao

- Plataforma Frontend: https://elite-tickets-vlr.vercel.app/
- API Backend: https://elite-tickets-api-uiqi.onrender.com

---

## 1. Processo de Engenharia: Uso de Ferramentas de IA e Contribuicao Humana

Em conformidade com as diretrizes do projeto, esta secao detalha as ferramentas de Inteligencia Artificial utilizadas, onde foram aplicadas e o que foi concebido e implementado diretamente de forma manual.

### Ferramentas de IA Utilizadas

- **Claude Code (Opus):**
  - Utilizado na estruturacao da arquitetura full-stack inicial, geracao de contratos de rotas REST, schemas de validacao com Zod, modelagem do Prisma Schema e implementacao das transacoes atomicas de reserva para prevencao de condicoes de corrida (race conditions) no banco de dados.
- **Gemini 3.7 Flash (High Thinking / Raciocinio Avancado):**
  - Utilizado na otimizacao de performance, refatoracao de regras de sessao e sincronizacao de cookies de autenticacao, algoritmo de agrupamento de sessoes por data, logica de busca instantanea com normalizacao de texto (remocao de acentos) e resolucao de problemas especificos de renderizacao mobile (como o encapsulamento do menu gaveta via React Portal para compatibilidade com o motor WebKit do iOS Safari).
- **Impeccable (Suite de Auditoria e Critica Heuristica de Frontend):**
  - Utilizado como ferramenta de apoio para auditoria de usabilidade, contraste de cores, hierarquia tipografica, responsividade em dispositivos moveis (smartphones e tablets de 320px a 768px), estados vazios, consistencia dos tokens do design system e eliminacao de quebras de layout na alternancia entre temas claro e escuro.

### O Que Foi Desenvolvido e Decidido SEM IA (Trabalho Humano e Iniciativa)

- **Concepcao do Modelo de Negocio e Regras da Plataforma:**
  - Definicao de uma solucao integrada para entretenimento regional que atende tanto cinemas de salas numeradas quanto shows e festivais de lotes abertos.
- **Definicao da Arquitetura RBAC (Controle de Acesso em 4 Niveis):**
  - Planejamento rigoroso das permissoes dos papeis CLIENT, ORGANIZER, PORTARIA e SUPER_ADMIN, garantindo isolamento total de rotas e dados sensiveis.
- **Selecao da Stack Tecnologica e Infraestrutura:**
  - Escolha estrategica de Next.js 14 App Router, TypeScript estrito, CSS Modules com Glassmorphism, Prisma ORM, PostgreSQL hospedado no Supabase, Vercel e Render.
- **Validacao Manual em Dispositivos Fisicos Reais:**
  - Testes manuais continuos em smartphones (iPhone e Android) para validacao de toque, ergonomia do mapa de assentos e funcionamento do scanner de camera na portaria.
- **Concepcao das Funcionalidades de Criatividade e Valor Agregado:**
  - Decisao humana de incluir sintetizador sonoro Web Audio API na portaria, compartilhamento direto via WhatsApp Web Share API, busca por CEP via ViaCEP, geolocalizacao oficial do IBGE e botao de ampliacao de QR Code para ambientes de alta luminosidade.
- **Curadoria dos Dados de Teste:**
  - Montagem e estruturacao das sessoes de filmes sincronizadas com dados do TMDB, criacao dos organizadores modelo e mapeamento de assentos por setor.

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
| Cliente | rafael@gmail.com | 123456 | Catalogo, Reserva, Meus Ingressos, Perfil |
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

## 8. Licenca

Este projeto esta sob a licenca MIT.
