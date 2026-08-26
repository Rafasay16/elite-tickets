# Utilização de IA no Projeto

Durante o desenvolvimento deste projeto, usei inteligência artificial como uma ferramenta prática de aceleração e suporte técnico, mas mantive total controle sobre a arquitetura, as regras de negócio e as decisões finais.

## Ferramentas de IA e Como Apliquei Cada Uma

### Claude Code (Opus)
Foquei no ganho de velocidade para tarefas repetitivas e estruturas iniciais.
- Gerei a base dos endpoints da API REST no Express e os controladores.
- Criei os schemas de validação no Zod a partir das regras que defini (como CPF, CNPJ e datas).
- Estruturei o boilerplate de operações CRUD e as tipagens em TypeScript.

### Gemini 3.7 Flash (High Thinking)
Usei como parceiro de raciocínio para discutir problemas lógicos e depurações mais complexas.
- Modelei a lógica de transações no Prisma para tratar concorrência e impedir que dois usuários reservem a mesma poltrona simultaneamente.
- Construí o algoritmo de agrupamento que organiza sessões do mesmo filme por dia da semana e horário.
- Resolvi um bug específico no Safari do iPhone, onde o backdrop-filter do cabeçalho cortava o menu lateral, aplicando createPortal para renderizar o componente direto no body.
- Implementei a normalização de texto na busca para ignorar acentos e caracteres especiais.

### Impeccable
Utilizei como apoio para auditoria visual e refinamento de interface.
- Validei o contraste de cores entre o tema claro e o tema escuro.
- Ajustei espaçamentos e usabilidade geral para telas menores no mobile.
- Padronizei ícones SVG e melhorei os estados vazios da interface (como telas sem ingressos ou eventos).

---

## O Que Desenvolvi Diretamente (Arquitetura e Decisões Próprias)

- **Arquitetura Geral:** Desenhei a estrutura em monorepo, organizando a API no backend (Controllers, Services, Schemas e Database) e o frontend em Next.js 14 App Router, separando de forma consciente Server Components de Client Components, além das pastas de serviços, utilitários e componentes reutilizáveis.
- **Modelagem de Dados:** Planejei as entidades e relacionamentos no PostgreSQL via Prisma (Usuários, Eventos, Assentos, Reservas, Cortesias e Logs), incluindo constraints e chaves únicas para travar assentos duplicados na raiz.
- **Regras de Negócio e Permissões (RBAC):** Estruturei os 4 níveis de acesso da plataforma (Cliente, Organizador, Portaria e Super Admin) com suas respectivas restrições e fluxos.
- **Design System e CSS:** Construí a base de variáveis com CSS Modules no globals.css, garantindo Dark/Light mode nativo e leve, sem carregar bibliotecas visuais pesadas.
- **Funcionalidades Autorais:** Desenvolvi recursos práticos focados na experiência do usuário, como feedback sonoro na validação de ingressos com a Web Audio API (som de sucesso vs. som de alerta para duplicidade), ampliação do QR Code em tela cheia, autopreenchimento de endereço via API do ViaCEP e integração de cidades com dados do IBGE.
- **Validação Mobile:** Testei exaustivamente a usabilidade em dispositivos reais (iOS e Android), refinando a precisão do toque no mapa de assentos, a leitura da câmera na portaria e a navegação.
- **Deploy e Infraestrutura:** Configurei e publiquei os ambientes em produção na Vercel (frontend), Render (backend) e Supabase (PostgreSQL).
