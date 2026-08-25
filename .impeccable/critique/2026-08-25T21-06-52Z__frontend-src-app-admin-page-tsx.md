---
timestamp: 2026-08-25T21-06-52Z
slug: frontend-src-app-admin-page-tsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Badge de status PAUSADO presente, mas faltam métricas de vendas, lotação e receita |
| 2 | Match System / Real World | 4 | Terminologia brasileira natural (*Cortesias*, *Pausar*, *Gerenciar Equipe*, *Porteiros*) |
| 3 | User Control and Freedom | 3 | Modais fecham no botão `X`, mas não possuem fechamento com tecla `Esc` ou clique fora |
| 4 | Consistency and Standards | 2 | Mais de 700 linhas com CSS inline extenso e uso de `window.alert()` para feedback |
| 5 | Error Prevention | 3 | Confirmação antes de revogar acesso de porteiros e busca automática via CEP |
| 6 | Recognition Rather Than Recall | 3 | Grid de assentos interativo para cortesia, mas cards não mostram miniatura do pôster |
| 7 | Flexibility and Efficiency | 2 | Ausência de barra de busca textual de eventos e ordenação rápida por data/vendas |
| 8 | Aesthetic and Minimalist Design | 3 | Boa base em vidro escuro, mas a barra de ações no topo está superlotada com 5 botões soltos |
| 9 | Error Recovery | 3 | Erros capturados em try/catch, porém exibidos via popup nativo do navegador |
| 10 | Help and Documentation | n/a | Painel de controle operacional do organizador (n/a por regra de modo) |
| **Total** | | **23/36** | **Aceitável (64%)** |

#### Design Specificity Verdict

**LLM Assessment:**
O Painel Admin do Organizador (`frontend/src/app/admin/page.tsx`) possui um conjunto poderoso de ferramentas (criação de eventos com busca por CEP, cortesias em tempo real com seleção de assentos, gestão de equipe de portaria com logs de bipagem e redefinição de senhas). Contudo, a experiência do usuário sofre com: (1) **Ausência de KPIs no topo** (resumo de eventos ativos, ingressos emitidos e receita estimada), (2) **Cards de eventos estáticos** sem exibição do pôster ou métricas de ocupação, (3) **Barra de topo sobrecarregada** com 5 controles enfileirados, e (4) **Uso excessivo de alertas nativos do navegador (`alert()`)** em vez de toasts/notificações no layout.

**Deterministic Scan:**
Varredura mecânica (`detect.mjs`) retornou **0 antipadrões** em `admin/page.tsx`.

#### Overall Impression
Um painel operacional muito completo em regras de negócio, mas que precisa de uma camada visual executiva com cards de métricas (KPIs), cards de eventos ricos com mini-pôster, busca instantânea e modais refinados.

#### What's Working
1. **Emissão de Cortesias VIP por Assento:** Seleção visual rápida de assentos disponíveis no mapa de assentos do evento.
2. **Gestão Descentralizada de Portaria:** Criação de porteiros com logs de validação e redefinição de senhas.
3. **Autopreenchimento por CEP (ViaCEP):** Facilita o cadastro de novos eventos sem digitação manual de endereço completo.

#### Priority Issues

- **[P1] Falta de Cards de Métricas Executivas (KPIs do Organizador)**
  - *Why it matters:* O organizador não tem visão panorâmica de quantos eventos estão ativos, total de cortesias emitidas e receita total acumulada.
  - *Fix:* Adicionar barra de KPIs com 4 cards de destaque (*Eventos Ativos*, *Lotação Média*, *Membros de Portaria*, *Ações Rápidas*).
  - *Suggested command:* `/impeccable layout` ou `/impeccable bolder`

- **[P2] Cards de Eventos Básicos e Sem Mini-Pôster**
  - *Why it matters:* Os eventos são exibidos como caixas de texto com botões, dificultando a identificação rápida de filmes e shows de grande apelo visual.
  - *Fix:* Enriquecer os cards com thumbnail do pôster, barra de ocupação/lotação e tags de categoria neon.
  - *Suggested command:* `/impeccable shape frontend/src/app/admin/page.tsx` ou `/impeccable delight`

- **[P3] Barra de Ações Superior Poluída & Uso de `alert()`**
  - *Why it matters:* 5 botões soltos disputam atenção no topo e popups nativos do navegador travam a experiência.
  - *Fix:* Reestruturar o header com busca rápida de eventos, agrupamento de filtros e toasts fluidos em vidro.
  - *Suggested command:* `/impeccable clarify` ou `/impeccable polish`

#### Persona Red Flags

- **Alex (Organizador / Power User):** Quer saber rapidamente a taxa de ocupação dos seus eventos antes de liberar cortesias VIP; atualmente precisa abrir os detalhes.
- **Jordan (Novo Organizador):** Fica confuso com a fileira de 5 botões no topo sem uma hierarquia visual clara entre o que é filtro e o que é ação principal.
- **Riley (Stress Tester):** Tenta fechar modais com a tecla `Escape` ou clicando no fundo escuro e fica preso.

#### Minor Observations
- O código atual possui centenas de estilos inline que podem ser organizados em um arquivo `Admin.module.css` modular.
- O campo de data nos filtros possui um botão de "X" de limpeza posicionado fora do alinhamento do botão.
