# Relatório de Bugfix - Painel de Clima

> Gerado em 2026-06-25. Origem: bugs.md (QA de 2026-06-25).

## Resumo
- Total de Bugs: 1
- Bugs Corrigidos: 1
- Testes de Regressão Criados: 2 (1 spec novo com 2 casos + reforço do spec de acessibilidade)

## Detalhes por Bug

| ID | Severidade | Status | Correção | Testes Criados |
|----|------------|--------|----------|----------------|
| BUG-01 | Média | Corrigido | `min-width: 0` em `.wx-card` (item de grid) para que `.wx-hourly-scroll { overflow-x: auto }` contenha a faixa de 24h sem expandir a largura do `document`; complemento de acessibilidade tornando a região rolável focável por teclado | `e2e/responsive-overflow.spec.ts` (#10, 375px e 1280px); reforço em `e2e/accessibility.spec.ts` (#9) |

### BUG-01 — Cartão de previsão horária estoura a largura da página (scroll horizontal global)

**Causa raiz:** `.wx-card` é item de grid (`.wx-grid`, `.wx-cols`, `.wx-lower-split`). Itens de grid/flex assumem `min-width: auto` por padrão, recusando-se a encolher abaixo da largura intrínseca do conteúdo. A faixa horária (`.wx-hourly-track`, ~1404px) forçava o cartão a esse tamanho, anulando o `overflow-x: auto` do `.wx-hourly-scroll` e empurrando a largura do `document` → scroll horizontal global em desktop e mobile.

**Correção (causa raiz):** `min-width: 0` em `.wx-card` (`frontend/src/index.css`). O item volta a poder encolher e o scroll passa a ocorrer **dentro** do cartão.

**Correção complementar (acessibilidade):** com o scroll interno agora efetivo, o axe acusou `scrollable-region-focusable` (impacto sério — região rolável precisa de acesso por teclado/Safari). `.wx-hourly-scroll` recebeu `tabIndex={0}`, `role="group"`, `aria-label` descritivo e estilo `:focus-visible`.

**Validação ao vivo (Playwright MCP, backend real Open-Meteo):**

| Viewport | `clientWidth` | `scrollWidth` da página | Scroll horizontal global? | Faixa rola dentro do cartão? |
|----------|---------------|--------------------------|----------------------------|------------------------------|
| Desktop 1280px | 1265px | 1265px | Não | Sim (1404 > 1046) |
| Mobile 375px | 360px | 360px | Não | Sim |

Evidências: `evidences/10-overflow-fixed-desktop.png`, `evidences/11-overflow-fixed-mobile.png`.

## Arquivos alterados
- `frontend/src/index.css` — `min-width: 0` em `.wx-card`; `:focus-visible` + `border-radius` em `.wx-hourly-scroll`.
- `frontend/src/components/hourly-forecast-card.tsx` — `tabIndex`/`role`/`aria-label` na região rolável.
- `frontend/e2e/responsive-overflow.spec.ts` — novo teste de regressão (#10).
- `tasks/prd-painel-de-clima/bugs.md` — status atualizado para Corrigido.

## Testes
- Testes unitários: TODOS PASSANDO (frontend 49/49)
- Testes de integração: TODOS PASSANDO (backend 34/34)
- Testes E2E: TODOS PASSANDO (11/11, incluindo #10 responsividade e #9 acessibilidade)
- Tipagem: SEM ERROS (`tsc --noEmit`)
