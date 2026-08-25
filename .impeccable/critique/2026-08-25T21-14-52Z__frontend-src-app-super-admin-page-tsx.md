---
timestamp: 2026-08-25T21-14-52Z
slug: frontend-src-app-super-admin-page-tsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Badges Ativo/Suspenso visíveis, mas taxas comerciais e cotas estão ocultas da tabela principal |
| 2 | Match System / Real World | 4 | Vocabulário corporativo adequado (*Produtora*, *Taxa de Serviço*, *Limite de Eventos*, *CNPJ*) |
| 3 | User Control and Freedom | 3 | Modais com cancelamento, mas sem suporte a fechar com `Esc` ou clique fora |
| 4 | Consistency and Standards | 2 | Mais de 300 linhas de CSS inline e uso de `window.alert()` para feedback |
| 5 | Error Prevention | 3 | Confirmação antes de suspender produtora e máscaras para CPF e CNPJ |
| 6 | Recognition Rather Than Recall | 2 | O super admin precisa clicar em cada linha para ver qual taxa comercial ou limite a produtora possui |
| 7 | Flexibility and Efficiency | 2 | Ausência de barra de busca/filtro de organizadores e botão de 1 clique para copiar a senha temporária |
| 8 | Aesthetic and Minimalist Design | 3 | Tabela em vidro escuro funcional, mas com aparência crua e sem cards de governança de plataforma |
| 9 | Error Recovery | 3 | Tratamento de exceções presente, mas dependente de popups do navegador |
| 10 | Help and Documentation | n/a | Painel mestre de governança e parametrização comercial (n/a por modo) |
| **Total** | | **22/36** | **Aceitável (61%)** |

#### Design Specificity Verdict

**LLM Assessment:**
O Painel Super Admin (`frontend/src/app/super-admin/page.tsx`) cumpre com rigor as funções de governança de parceiros (cadastro de produtoras, geração de credenciais temporárias, definição de taxa de serviço e suspensão de contas). Entretanto, a interface atual funciona como uma tabela simples: esconde as métricas comerciais mais importantes (taxa % e limite de eventos) dentro de um modal oculto, não possui barra de busca de parceiros por nome/e-mail/CNPJ, não possui cards de resumo no topo e exibe senhas geradas sem botão de cópia rápida.

**Deterministic Scan:**
Varredura automatizada (`detect.mjs`) retornou **0 antipadrões** em `super-admin/page.tsx`.

#### Overall Impression
Uma ferramenta de governança robusta que pode se transformar em um centro de comando master com KPIs de plataforma, tabela transparente com exibição direta de taxas/cotas, busca em tempo real e botão de cópia de credenciais com 1 clique.

#### What's Working
1. **Geração Segura de Senha Temporária:** Algoritmo alfanumérico automático para envio inicial a novos parceiros.
2. **Parametrização Comercial Individual:** Capacidade de customizar a taxa percentual de serviço e a cota de eventos por produtora.
3. **Máscaras de Documento:** Suporte nativo para validação de CPF e CNPJ.

#### Priority Issues

- **[P1] Falta de Visibilidade das Taxas e Cotas na Tabela**
  - *Why it matters:* O administrador precisa clicar no ícone de engrenagem de cada linha para saber qual taxa (%) e limite de eventos cada produtora tem configurado.
  - *Fix:* Adicionar colunas de "Taxa de Serviço (%)" e "Cota de Eventos" diretamente na tabela com badges luminosos.
  - *Suggested command:* `/impeccable layout` ou `/impeccable shape frontend/src/app/super-admin/page.tsx`

- **[P2] Ausência de KPIs de Plataforma e Barra de Busca**
  - *Why it matters:* Conforme a plataforma cresce, o Super Admin não tem visão consolidada do número de produtoras ativas e não consegue buscar parceiros por nome ou CNPJ.
  - *Fix:* Adicionar 4 cards de KPIs de governança e barra de busca instantânea com filtro de status (*Todas*, *Ativas*, *Suspensas*).
  - *Suggested command:* `/impeccable bolder` ou `/impeccable clarify`

- **[P3] Experiência de Geração de Senha e Modais**
  - *Why it matters:* A senha temporária gerada não tem botão de cópia para a área de transferência (`navigator.clipboard.writeText`), e os modais não fecham com a tecla `Escape`.
  - *Fix:* Incluir botão "Copiar Senha", fecho por `Escape`/backdrop e toasts fluidos em vez de `window.alert()`.
  - *Suggested command:* `/impeccable delight` ou `/impeccable polish`

#### Persona Red Flags

- **Alex (Super Admin):** Cadastra uma nova produtora e precisa selecionar o texto da senha manualmente para enviar pelo WhatsApp/E-mail em vez de usar 1 clique.
- **Jordan (Auditor de Contas):** Procura uma produtora específica pelo CNPJ e é forçado a rolar manualmente toda a lista.
- **Riley (Stress Tester):** Clica fora do modal esperando que ele feche e fica bloqueado.

#### Minor Observations
- O código usa estilos inline no JSX e pode ser estruturado em `SuperAdmin.module.css`.
- O botão de alternância Ativar/Suspender pode ter micro-confirmação visual com toast em vez de `confirm()` nativo.
