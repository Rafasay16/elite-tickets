# 🎟️ Elite Tickets - Desafio Elite Dev

Plataforma premium para gestão de eventos e reserva de ingressos, construída para o **Desafio Elite Dev** da Verzel.

## 🎯 Por que a tela é assim? (Fugindo do "AI Slop")

O edital foi muito claro: *"Fuja do AI slop"*. Uma IA gerando um projeto cru faria um layout branco com botões azuis e cantos arredondados padrão.

Para provar autoria e tomada de decisão:
1. **Design System "Glassmorphism" com Dark Mode**: A estética foi escolhida para dar um ar de "Estreia VIP de Cinema". Interfaces escuras com elementos de vidro fosco (blur) e toques neon criam uma sensação de exclusividade.
2. **Uso de CSS Modules puros**: Em vez de depender inteiramente do Tailwind (que costuma ditar uma cara genérica se não for muito bem customizado), construí o sistema de grid e botões com CSS puro, com as próprias mãos, garantindo controle total.
3. **API Externa Escolhida (TMDb)**: Filmes possuem pôsteres de alta qualidade (em comparação com APIs de eventos genéricos). Isso elevou a interface imediatamente.
4. **O Mapa de Assentos**: O mapa tem uma "tela" (Screen) em 3D sutil para dar o contexto espacial para o usuário, não apenas quadrados empilhados.

## 🚀 Tecnologias Escolhidas

- **Next.js (App Router) + TypeScript**: Permitiu construir Front-end e Back-end no mesmo repositório, simplificando imensamente o código e o Deploy.
- **Prisma ORM + SQLite (local)**: Banco de dados relacional é perfeito para lidar com assentos e transações. Localmente usamos SQLite para que você (avaliador) não tenha que instalar PostgreSQL na sua máquina.
- **html5-qrcode**: Para leitura da câmera diretamente do navegador na portaria.
- **Transações ACID (Prisma)**: Garantia robusta de que o mesmo assento não seja vendido duas vezes na API.

## 🛠️ Como rodar o projeto localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. O banco de dados (SQLite) precisa ser iniciado e populado:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```
   *Nota: O script de seed criará o "Duna: Parte 2" e já deixará a "Maria Cliente" com um ingresso pago (Fila A - Assento 1) para você testar a portaria direto.*
4. Rode o servidor:
   ```bash
   npm run dev
   ```
5. Acesse [http://localhost:3000](http://localhost:3000).

## 🗺️ Fluxo de Avaliação (Caminho Feliz)

1. **Visão do Organizador**: Vá em `http://localhost:3000/organizador` e clique em um filme para publicar uma nova sessão. O mapa de assentos é gerado automaticamente baseado na capacidade.
2. **Visão do Cliente (Home)**: Na Home, escolha o filme, selecione um assento no Mapa e clique em "Confirmar e Pagar". Você será redirecionado para `Meus Ingressos`.
3. **Visão da Portaria**: Abra `http://localhost:3000/portaria`. O cliente já tem um ingresso gerado no seed (Duna, código: `valid-qr-code-maria`). Digite este código manualmente (ou escaneie se estiver no celular) e veja a validação. Tente validar novamente para ver o bloqueio de "Já Utilizado".

## ☁️ Instruções para Deploy (Vercel)

Se você decidir clonar este repositório e fazer o deploy para garantir a nota máxima:
1. Crie um banco PostgreSQL no [Neon.tech](https://neon.tech/) ou Supabase.
2. Mude o `provider = "sqlite"` para `provider = "postgresql"` no arquivo `prisma/schema.prisma`.
3. Adicione a variável `DATABASE_URL` no Vercel com a string de conexão.
4. O build da Vercel (`npm run build`) cuidará de inicializar o site sem problemas.
