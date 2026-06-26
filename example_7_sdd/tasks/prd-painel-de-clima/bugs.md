# Relatório de Bugs - Painel de Clima

> Gerado pelo QA em 2026-06-25. Origem: validação funcional + responsividade via Playwright MCP.

## Resumo

| ID | Descrição | Severidade | Status |
|----|-----------|------------|--------|
| BUG-01 | Scroll horizontal da página inteira causado pelo cartão "Próximas 24 horas" (overflow não contido) | Média | Corrigido |

---

## BUG-01 — Cartão de previsão horária estoura a largura da página (scroll horizontal global)

**Severidade:** Média
**Requisito impactado:** PRD → "Experiência do usuário → Considerações de UI/UX": *"layout responsivo adequado a uso em tela dividida (editor + navegador) e em telas menores"*.
**Componente:** `frontend/src/components/hourly-forecast-card.tsx` + `frontend/src/index.css` (`.wx-hourly-scroll` / `.wx-card`).

### Descrição

O cartão **"Próximas 24 horas"** renderiza uma faixa horária com 24 colunas de largura fixa (`COLUMN_WIDTH = 58px` → `wx-hourly-track` com `width` ≈ 1404px). Embora `.wx-hourly-scroll` tenha `overflow-x: auto`, o scroll interno **não é acionado**: o cartão cresce até a largura intrínseca do conteúdo e empurra a largura do `document`, gerando **scroll horizontal da página inteira** — em desktop **e** em mobile.

Causa raiz: falta de `min-width: 0` no item de layout (flex/grid) que contém o cartão. Sem isso, o item assume `min-width: auto` e se recusa a encolher abaixo da largura do conteúdo, anulando o `overflow-x: auto` do container de scroll interno.

### Evidências (medições via `document.documentElement`)

| Viewport | `clientWidth` | `scrollWidth` da página | Largura do cartão 24h | Overflow? |
|----------|---------------|-------------------------|------------------------|-----------|
| Desktop  | 1265px | **1530px** | 1438px | Sim |
| Mobile   | 375px  | **1440px** | ~1404px | Sim |

- `.wx-hourly-scroll`: `clientWidth === scrollWidth` (1404) → o scroll interno nunca encolhe; quem rola é a página.
- Screenshots: `evidences/05-responsive-mobile.png`, `evidences/07-horizontal-overflow-bug.png`, `evidences/03-dashboard-full.png` (curva da faixa horária "vaza" para a direita além do layout).

### Comportamento esperado

A faixa de 24h deve rolar **dentro do próprio cartão** (`overflow-x: auto` contido), sem expandir a largura do `document`. A página não deve apresentar scroll horizontal em nenhum breakpoint.

### Passos para reproduzir

1. Abrir `http://localhost:5173` e selecionar qualquer cidade (ex.: "São Paulo").
2. Observar (desktop, ~1280px) que a página apresenta scrollbar horizontal e a curva da faixa horária ultrapassa a margem direita do layout.
3. Reduzir o viewport para mobile (~375px) e confirmar `document.documentElement.scrollWidth` ≫ `clientWidth`.

### Sugestão de correção

Adicionar `min-width: 0` ao(s) item(ns) de layout que envolvem o cartão (ex.: `.wx-card` e/ou o container de coluna do grid), garantindo que `.wx-hourly-scroll { overflow-x: auto }` efetivamente contenha a faixa. Validar com teste de regressão que `document.documentElement.scrollWidth <= clientWidth` em 375px e 1280px.

### Resolução

- **Status:** Corrigido
- **Correção aplicada:** Adicionado `min-width: 0` a `.wx-card` em `frontend/src/index.css`. Como `.wx-card` é item de grid (`.wx-grid`, `.wx-cols`, `.wx-lower-split`), seu `min-width: auto` padrão impedia o encolhimento abaixo da largura intrínseca da faixa de 24h (~1404px), anulando o `overflow-x: auto` interno e empurrando a largura do `document`. Com `min-width: 0` o item passa a encolher e o `.wx-hourly-scroll` contém a faixa internamente. Verificado ao vivo via Playwright MCP: em 1280px `scrollWidth=clientWidth=1265` e em 375px `scrollWidth=clientWidth=360` (sem scroll horizontal global), com o cartão rolando internamente (`scrollWidth 1404 > clientWidth`).
- **Correção complementar (acessibilidade):** Ao ativar o scroll interno real, o axe passou a exigir que a região rolável seja acessível por teclado (`scrollable-region-focusable`, impacto sério). Tornou-se `.wx-hourly-scroll` focável com `tabIndex={0}`, `role="group"` e `aria-label` descritivo, além de estilo `:focus-visible` (anel de foco) em `index.css`.
- **Testes de regressão:**
  - `frontend/e2e/responsive-overflow.spec.ts` (#10) — valida `document.documentElement.scrollWidth <= clientWidth` em 375px e 1280px e que `.wx-hourly-scroll` rola internamente. Falha se o `min-width: 0` for revertido.
  - `frontend/e2e/accessibility.spec.ts` (#9) — passa a cobrir a focabilidade por teclado da região rolável (axe sem violações).
- **Evidências:** `evidences/10-overflow-fixed-desktop.png`, `evidences/11-overflow-fixed-mobile.png`.
