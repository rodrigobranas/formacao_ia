---
status: completed
title: Validação E2E, testes finais e QA
type: frontend
complexity: medium
dependencies:
  - task_02
---

# Task 03: Validação E2E, testes finais e QA

## Overview

Esta task fecha o ciclo de qualidade da feature i18n: adiciona suporte a locale nos testes Playwright, atualiza as 9 specs E2E existentes para conviver com PT-BR default e EN explícito, e executa o checklist manual do PRD (persistência, acessibilidade, layout EN vs PT-BR). Garante que a entrega MVP atinge os exit criteria antes do sign-off.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST criar helper Playwright `setLocale(page, 'pt-BR' | 'en')` em `frontend/e2e/support/locale.ts` setando `wx-locale` antes da navegação
- MUST adicionar spec E2E dedicada: troca para EN via switcher, verificação de strings hero/search e `html[lang="en"]`
- MUST atualizar specs E2E existentes que asseram copy PT para usar locale explícito ou variantes EN quando aplicável
- MUST verificar persistência: após escolher EN e reload, app permanece em EN (PRD exit criteria: 10/10 trials manual)
- MUST passar smoke test de acessibilidade: switcher keyboard-focusable, `aria-pressed`, `lang` no `<html>` (PRD Accessibility)
- MUST validar layout EN em viewports mobile/desktop sem truncamento crítico (PRD Success Metrics — Layout)
- MUST confirmar latência percebida de troca instantânea (<100ms percebido, sem spinner)
- SHOULD documentar no PR/commit que locale é preference-based, não URL-based (PRD Risk mitigation)
- MUST NOT introduzir lazy-loading de bundles ou mudanças de backend
</requirements>

## Subtasks
- [x] 3.1 Criar `e2e/support/locale.ts` e integrar em `e2e/support/actions.ts` se necessário
- [x] 3.2 Escrever spec de locale switch + persistência após reload
- [x] 3.3 Atualizar 9 specs Playwright existentes para compatibilidade i18n
- [x] 3.4 Executar checklist manual PRD lado a lado (PT-BR vs EN) e registrar evidência
- [x] 3.5 Corrigir regressões de overflow/a11y encontradas na validação

## Implementation Details

Ver TechSpec seções "Testing Approach" (Integration / E2E) e "Development Sequencing" (passos 10–11).

**Criar:**
- `frontend/e2e/support/locale.ts` — `setLocale(page, locale)`
- `frontend/e2e/locale-switch.spec.ts` (ou nome equivalente) — fluxo EN + persistência + `html[lang]`

**Modificar (specs com asserções de copy PT):**
- `frontend/e2e/main-flow.spec.ts`
- `frontend/e2e/accessibility.spec.ts`
- `frontend/e2e/autocomplete.spec.ts`
- `frontend/e2e/city-not-found.spec.ts`
- `frontend/e2e/geolocation.spec.ts`
- `frontend/e2e/loading-skeletons.spec.ts`
- `frontend/e2e/network-failure.spec.ts`
- `frontend/e2e/air-unavailable.spec.ts`
- `frontend/e2e/responsive-overflow.spec.ts`
- `frontend/e2e/support/actions.ts` — seletor combobox `Buscar cidade` pode precisar helper i18n

Padrão recomendado (TechSpec): specs default rodam em PT-BR; specs EN chamam `setLocale(page, 'en')` antes de `page.goto`.

Checklist manual PRD (MVP exit criteria):
1. Primeira visita → PT-BR, 🇧🇷 ativo
2. Clique 🇺🇸 → UI instantânea em EN, labels clima e datas EN
3. Reload → permanece EN
4. Limpar `localStorage` → volta PT-BR
5. Keyboard: foco e Enter/Space no switcher
6. Screen reader smoke: `lang` anunciado corretamente
7. Side-by-side: zero strings PT visíveis em modo EN

### Relevant Files
- `frontend/e2e/support/actions.ts` — helpers compartilhados de navegação
- `frontend/e2e/accessibility.spec.ts` — candidato a assert `html[lang]`
- `frontend/e2e/main-flow.spec.ts` — fluxo principal com copy PT hoje
- `frontend/src/components/locale-switcher.tsx` — alvo de interação E2E (task 01)
- `PRODUCT.md` / `DESIGN.md` — critérios de layout flex para expansão EN

### Dependent Files
- Nenhum arquivo de produção novo esperado; apenas E2E support e correções pontuais de layout se QA encontrar regressões

### Related ADRs
- [ADR-001: Full UI i18n with PT-BR Default and Flag Switcher](../adrs/adr-001.md) — critérios de persistência e a11y
- [ADR-002: react-i18next as Frontend i18n Library](../adrs/adr-002.md) — troca instantânea sem reload

## Deliverables
- Helper `setLocale` reutilizável nos E2E
- Spec E2E de locale switch + persistência + `html[lang]`
- 9 specs Playwright existentes passando com suporte i18n
- Checklist manual PRD executado e documentado (pass/fail por item)
- Correções de layout/a11y se necessárias (escopo mínimo)
- Unit tests com 80%+ coverage **(REQUIRED)** — manter cobertura da suite Vitest intacta
- Integration tests E2E Playwright **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Suite Vitest completa (`npm test`) continua passando sem regressão após mudanças E2E
- Integration tests (Playwright):
  - [x] `setLocale(page, 'en')` + navegação: hero/search exibem strings EN conhecidas
  - [x] Clique no switcher 🇺🇸 in-app muda copy visível sem full page reload
  - [x] Após reload com `wx-locale=en`, página carrega direto em EN
  - [x] `accessibility.spec.ts`: `html[lang]` igual a locale ativo após switch
  - [x] `city-not-found.spec.ts`: mensagem EN quando locale EN (`setLocale` pré-navegação)
  - [x] `network-failure.spec.ts`: toast e botão retry em EN com locale EN
  - [x] `geolocation.spec.ts`: botão geo e notice EN com locale EN
  - [x] `main-flow.spec.ts`: passa em PT-BR default (sem setLocale)
  - [x] `responsive-overflow.spec.ts`: headings EN não truncam em viewport estreito
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing (`npm test` + `npx playwright test`)
- Test coverage >=80% (Vitest)
- PRD MVP exit criteria atendidos: manual QA checklist 100% pass
- Persistência validada em ≥10 reloads consecutivos com locale EN
- Nenhuma string user-visible PT em modo EN durante QA side-by-side
- Switcher operável por teclado; `html[lang]` correto em ambos locales

## Validation Evidence

- `npm run test:e2e`: 21/21 Playwright tests passed, including locale switch, 10 consecutive EN reload persistence checks, EN city-not-found/network/geolocation paths, a11y lang/aria state, and EN mobile/desktop overflow checks.
- `npm test -- --coverage`: 24 Vitest files / 77 tests passed; statement coverage 86.6% (>=80% target).
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.

Manual PRD checklist evidence:

1. First visit → PT-BR, 🇧🇷 active: covered by locale-switch E2E initial assertions.
2. Click 🇺🇸 → UI instantânea em EN, labels clima e datas EN: covered by locale-switch E2E with no spinner/no navigation and EN hero/search/forecast assertions.
3. Reload → permanece EN: covered by 10 consecutive reload assertions with `html[lang="en"]` and EN search.
4. Limpar `localStorage` → volta PT-BR: covered by locale-switch E2E clear-storage/reload assertions.
5. Keyboard: foco e Enter/Space no switcher: covered by locale-switch E2E keyboard test.
6. Screen reader smoke: `lang` anunciado corretamente: covered by accessibility E2E `html[lang]` and `aria-pressed` assertions.
7. Side-by-side: zero strings PT visíveis em modo EN: covered by EN visible-text scan after city load.
