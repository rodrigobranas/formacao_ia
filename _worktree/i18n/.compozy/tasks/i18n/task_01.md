---
status: completed
title: Infraestrutura i18n e controles de locale
type: frontend
complexity: medium
dependencies: []
---

# Task 01: Infraestrutura i18n e controles de locale

## Overview

Esta task estabelece a fundação de internacionalização no frontend: instala react-i18next, inicializa a instância i18n com persistência em `localStorage`, sincroniza o atributo `lang` do documento e entrega o hook `useLocale` junto com o componente `LocaleSwitcher` pronto para uso na top bar. Sem esta base, nenhuma migração de strings ou formatação locale-aware pode ocorrer.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST instalar `i18next` e `react-i18next` em `frontend/package.json`
- MUST criar `frontend/src/i18n/config.ts` com tipos `AppLocale`, chave `wx-locale`, default `pt-BR` e lista `['pt-BR', 'en']` — ver TechSpec seção "Core Interfaces"
- MUST ler `localStorage` de forma síncrona antes do primeiro render para evitar flash de locale errado (ADR-002)
- MUST NOT auto-detectar idioma do browser na primeira visita; ausência de chave → PT-BR (PRD Core Feature 1)
- MUST criar arquivos JSON base em `frontend/src/i18n/locales/pt-BR.json` e `en.json` (estrutura flat, chaves semânticas iniciais para brand/switcher)
- MUST envolver a árvore React com `I18nextProvider` em `frontend/src/main.tsx`
- MUST alterar `frontend/index.html` para `lang="pt-BR"` e sincronizar via `syncDocumentLang()` em mudanças de locale
- MUST criar `frontend/src/hooks/use-locale.ts` expondo `locale`, `setLocale` e `localeLabel` para aria
- MUST criar `frontend/src/components/locale-switcher.tsx` com toggle 🇧🇷/🇺🇸, `aria-pressed`, nomes acessíveis "Português (Brasil)" e "English" — não depender só do emoji (ADR-001)
- MUST criar helper de teste `renderWithI18n` em `frontend/src/i18n/test-utils.ts` (ou caminho equivalente) para uso nas tasks seguintes
- SHOULD criar stub de `frontend/src/i18n/translate-api-label.ts` retornando o label original (implementação completa na task 02)
</requirements>

## Subtasks
- [x] 1.1 Instalar dependências i18n e criar módulo `frontend/src/i18n/config.ts` com init, fallback PT-BR e listener de `changeLanguage`
- [x] 1.2 Criar JSONs base `pt-BR.json` e `en.json` com chaves mínimas (brand, switcher, meta)
- [x] 1.3 Integrar `I18nextProvider` em `main.tsx` e corrigir `lang` default em `index.html`
- [x] 1.4 Implementar `use-locale.ts` e `locale-switcher.tsx` conforme padrão visual da top bar (mesmo affordance de °C/°F)
- [x] 1.5 Criar `renderWithI18n` e testes unitários de config e switcher

## Implementation Details

Ver TechSpec seções "System Architecture", "Core Interfaces" e "Development Sequencing" (passos 1–2, 9).

Arquivos a **criar**:
- `frontend/src/i18n/config.ts`
- `frontend/src/i18n/locales/pt-BR.json`
- `frontend/src/i18n/locales/en.json`
- `frontend/src/i18n/translate-api-label.ts` (stub)
- `frontend/src/i18n/test-utils.ts`
- `frontend/src/hooks/use-locale.ts`
- `frontend/src/components/locale-switcher.tsx`

Arquivos a **modificar**:
- `frontend/package.json` — adicionar deps
- `frontend/src/main.tsx` — provider + init antes do render
- `frontend/index.html` — `lang="pt-BR"`

Estado atual de `main.tsx` (sem i18n):

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### Relevant Files
- `frontend/src/main.tsx` — ponto de entrada; precisa do provider
- `frontend/index.html` — hoje `lang="en"`; deve ser PT-BR + sync JS
- `frontend/src/components/top-bar.tsx` — referência de layout para posicionar switcher na task 02
- `frontend/package.json` — sem i18next hoje

### Dependent Files
- `frontend/src/pages/weather-dashboard-page.tsx` — comporá `LocaleSwitcher` na task 02
- Todos os componentes com strings hardcoded — consumirão `useTranslation` na task 02
- Arquivos Vitest — usarão `renderWithI18n` a partir desta task

### Related ADRs
- [ADR-001: Full UI i18n with PT-BR Default and Flag Switcher](../adrs/adr-001.md) — default PT-BR, switcher na top bar, persistência
- [ADR-002: react-i18next as Frontend i18n Library](../adrs/adr-002.md) — stack escolhida e padrão de init

## Deliverables
- Módulo i18n funcional com PT-BR default e persistência `wx-locale`
- Hook `useLocale` e componente `LocaleSwitcher` renderizável isoladamente
- `document.documentElement.lang` sincronizado com locale ativo
- Helper `renderWithI18n` exportado para testes
- Unit tests com 80%+ coverage **(REQUIRED)**
- Integration tests para init + troca de locale **(REQUIRED)**

## Tests
- Unit tests:
  - [x] `initI18n()` sem valor em `localStorage` retorna locale `pt-BR`
  - [x] `initI18n()` com `wx-locale=en` carrega inglês
  - [x] Valor inválido em `localStorage` (ex.: `fr`) faz fallback para `pt-BR`
  - [x] `changeLanguage('en')` persiste `wx-locale` em `localStorage`
  - [x] `syncDocumentLang('en')` define `document.documentElement.lang` como `en`
  - [x] `LocaleSwitcher` com locale PT-BR: botão 🇧🇷 tem `aria-pressed="true"`
  - [x] `LocaleSwitcher`: clique em 🇺🇸 chama `setLocale('en')` e inverte `aria-pressed`
  - [x] `LocaleSwitcher`: operável via teclado (Enter/Space) no botão inativo
- Integration tests:
  - [x] `renderWithI18n(<LocaleSwitcher />, { locale: 'en' })` renderiza com labels EN nos aria
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- App inicia em PT-BR na primeira visita (sem chave salva)
- Troca de locale via switcher persiste após reload manual
- `html[lang]` reflete locale ativo imediatamente após troca
