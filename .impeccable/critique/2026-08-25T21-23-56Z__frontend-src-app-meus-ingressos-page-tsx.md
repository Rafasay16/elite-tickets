---
timestamp: 2026-08-25T21-23-56Z
slug: frontend-src-app-meus-ingressos-page-tsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Banner de sucesso no checkout presente, mas falta status claro do ingresso (*Válido*, *Utilizado*, *Hoje*) |
| 2 | Match System / Real World | 4 | Excelente metáfora de ticket stub com picote e recorte lateral |
| 3 | User Control and Freedom | 3 | Opções de compartilhar e excluir expirados presentes |
| 4 | Consistency and Standards | 3 | Segue os tokens em dark glass, mas o modal de QR code tem estilos inline |
| 5 | Error Prevention | 3 | Confirmação antes de remover tickets expirados |
| 6 | Recognition Rather Than Recall | 3 | Fila e Assento em destaque neon, mas falta indicador de contagem regressiva para o evento |
| 7 | Flexibility and Efficiency | 2 | Ausência de abas para separar *Próximos Ingressos* de *Histórico / Passados* e download de imagem/passe |
| 8 | Aesthetic and Minimalist Design | 3 | Bom visual de ingresso, mas QR code oculto atrás de botão adiciona fricção desnecessária na fila |
| 9 | Error Recovery | 3 | Mensagens de acesso negado claras para ingressos compartilhados |
| 10 | Help and Documentation | n/a | Carteira digital de ingressos do cliente (n/a por modo) |
| **Total** | | **24/36** | **Bom (67%)** |

#### Design Specificity Verdict

**LLM Assessment:**
A página de Meus Ingressos (`frontend/src/app/meus-ingressos/`) é o momento ápice da experiência do cliente pós-compra. Ela possui uma base estética interessante com o recorte de canhoto (*ticket stub*), mas sofre de três grandes limitações: (1) **Fricção na fila de entrada:** o QR code fica escondido atrás de um modal ("Ver QR Code"), forçando o cliente a clicar enquanto está na fila da portaria, (2) **Mistura de ingressos ativos e passados** na mesma grade sem abas organizadoras, e (3) **Estado vazio sem CTA** para explorar novos eventos do catálogo.

**Deterministic Scan:**
Varredura mecânica (`detect.mjs`) retornou **0 antipadrões** em `page.tsx` e `TicketCard.tsx`.

#### Overall Impression
Uma carteira digital charmosa, mas que pode se tornar uma experiência de passe digital de nível internacional, com exibição instantânea do QR code, abas *Próximos* vs *Passados*, badge com contagem para o evento e layout de cartão holográfico.

#### What's Working
1. **Design de Canhoto de Ingresso:** Detalhes de picote e recorte semicircular (`.cutout`) criam identificação imediata.
2. **Badge de Assento Neon:** Fila e Assento em destaque de alto contraste facilitam a localização dentro da sala/estádio.
3. **Compartilhamento Rápido:** Integração com o componente `ShareButton`.

#### Priority Issues

- **[P1] Fricção de Acesso ao QR Code na Portaria**
  - *Why it matters:* Clientes na fila de entrada precisam abrir um modal separado para exibir o QR code, gerando atraso e cliques desnecessários.
  - *Fix:* Exibir o QR code diretamente no corpo do card do ingresso (ou com expansão suave e opção de tela cheia tátil).
  - *Suggested command:* `/impeccable delight` ou `/impeccable shape frontend/src/app/meus-ingressos/page.tsx`

- **[P2] Falta de Abas de Organização (Próximos vs Encerrados)**
  - *Why it matters:* Ingressos antigos de meses atrás ficam misturados com os ingressos de shows deste fim de semana.
  - *Fix:* Criar abas com contadores (*Próximos Eventos* e *Histórico / Utilizados*).
  - *Suggested command:* `/impeccable layout` ou `/impeccable clarify`

- **[P3] Estado Vazio sem Direcionamento de Compra**
  - *Why it matters:* Usuários sem ingressos veem apenas um texto cinza plano, sem convite visual para descobrir filmes ou festivais.
  - *Fix:* Adicionar ilustração de ingresso em neon com botão *"Explorar Eventos"*.
  - *Suggested command:* `/impeccable onboard` ou `/impeccable bolder`

#### Persona Red Flags

- **Casey (Usuário Mobile na Fila do Show):** Com conexão móvel instável e na fila da entrada, precisa clicar no modal de QR code para apresentar ao porteiro.
- **Jordan (Primeira Compra):** Quer compartilhar o ingresso direto no WhatsApp ou salvar no celular, mas não vê botão de download rápido.
- **Alex (Frequenta Eventos):** Tem vários ingressos antigos e precisa rolar muito para achar o evento de hoje.

#### Minor Observations
- O botão de exclusão de ingressos expirados na tag vermelha tem comportamento de hover que pode confundir toques no celular.
- A contagem regressiva para o evento (*Ex: "É hoje!"*, *"Em 2 dias"*) aumentaria a expectativa emocional do participante.
