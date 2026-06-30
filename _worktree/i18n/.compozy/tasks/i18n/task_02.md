---
status: completed
title: Tradução completa da UI e labels dinâmicos
type: frontend
complexity: critical
dependencies:
  - task_01
---

# Task 02: Tradução completa da UI e labels dinâmicos

## Overview

Esta task migra toda a superfície user-facing do dashboard de strings PT hardcoded para react-i18next, incluindo copy estática (~55 chaves), mensagens de erro por código, formatação locale-aware de datas/vento e remapeamento de labels dinâmicos da API via namespace `apiLabels`. É o núcleo funcional do PRD: ao concluir, EN e PT-BR devem ser experiências coerentes, com `LocaleSwitcher` integrado na top bar.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST migrar todas as strings user-visible listadas no PRD seção "Translated Interface Copy" para chaves i18n em ambos JSONs
- MUST manter "Tempo" como brand name fixo (não traduzir) em ambos locales; tagline traduzível
- MUST compor `LocaleSwitcher` no `actionsSlot` de `weather-dashboard-page.tsx` junto a `ApiStatusPill` e `GeolocationButton`
- MUST refatorar `weather-api.ts` para expor apenas `WeatherErrorCode` sem strings PT em `ERROR_MESSAGE`; traduzir na camada UI
- MUST remover fallback PT hardcoded em `use-weather.ts` (ex.: "Falha de rede.")
- MUST implementar `translateApiLabel()` completo usando namespace `apiLabels` com PT strings do backend como chaves (ADR-003)
- MUST cobrir todos os labels de `backend/src/services/weather-codes.ts`: 28 condições WMO, fallback `Tempo`, 5 UV, 6 AQI + descrições + pior caso, e `Localização atual` de `weather-service.ts`
- MUST aplicar `translateApiLabel` nos boundaries de exibição: hero, daily, metrics (UV), air-quality — não no service layer
- MUST atualizar `format.ts` para aceitar locale e usar `Intl` (sem `'pt-BR'` hardcoded); cardinais de vento EN vs PT
- MUST migrar/remover `GROUP_LABEL` em `weather-code.ts`; alinhar mapas `UV_COLOR`/`AQI_COLOR` que hoje usam chaves PT
- MUST usar conjunto AQI simplificado bilíngue conforme TechSpec (Good/Fair/Moderate/Poor/Very poor/Hazardous)
- MUST NOT alterar contrato ou payloads do backend
- SHOULD inventariar strings via grep antes de sign-off; zero strings user-visible sem tradução EN
</requirements>

## Subtasks
- [x] 2.1 Popular `pt-BR.json` e `en.json` com inventário completo de strings estáticas (~55 chaves semânticas)
- [x] 2.2 Migrar componentes shell (top-bar, search, geo, api pill, error toast) e cards (hero, hourly, daily, metrics, sun, air, loading)
- [x] 2.3 Traduzir estados da página: geo denied/unsupported, idle placeholder, city-not-found, error toast via código
- [x] 2.4 Implementar `apiLabels` + `translateApiLabel` e integrar nos componentes de exibição
- [x] 2.5 Atualizar `format.ts` e propagar locale ativo nos consumidores; integrar `LocaleSwitcher` na top bar
- [x] 2.6 Atualizar suite Vitest (~12 arquivos) com `renderWithI18n` e asserções PT/EN

## Implementation Details

Ver TechSpec seções "Data Models", "Impact Analysis", "Integration Points" e "Development Sequencing" (passos 3–8).

**Componentes com strings PT hardcoded (migrar):**
- `frontend/src/components/top-bar.tsx` — tagline `Open-Meteo`
- `frontend/src/components/city-search.tsx` — placeholder, aria
- `frontend/src/components/suggestion-list.tsx` — empty state, listbox aria
- `frontend/src/components/geolocation-button.tsx`
- `frontend/src/components/api-status-pill.tsx`
- `frontend/src/components/error-toast.tsx`
- `frontend/src/components/weather-hero.tsx`
- `frontend/src/components/hero-quick-stats.tsx`
- `frontend/src/components/hourly-forecast-card.tsx`
- `frontend/src/components/daily-forecast-card.tsx`
- `frontend/src/components/detailed-metrics-card.tsx`
- `frontend/src/components/sun-arc-card.tsx`
- `frontend/src/components/air-quality-card.tsx`
- `frontend/src/components/loading-skeletons.tsx`
- `frontend/src/pages/weather-dashboard-page.tsx` — `GEO_NOTICE`, idle, city-not-found, compose switcher

**Lib/services:**
- `frontend/src/services/weather-api.ts` — remover `ERROR_MESSAGE` PT
- `frontend/src/hooks/use-weather.ts` — erro por código
- `frontend/src/lib/format.ts` — locale param + Intl
- `frontend/src/lib/weather-code.ts` — substituir `GROUP_LABEL`
- `frontend/src/i18n/translate-api-label.ts` — implementação completa
- `frontend/src/test/fixtures.ts` — manter labels PT nos mocks de API (backend contract)

Composição atual do `actionsSlot` (adicionar `LocaleSwitcher`):

```tsx
actionsSlot={
  <>
    <ApiStatusPill status={apiStatus} />
    <GeolocationButton status={geo.status} onClick={geo.requestLocation} />
  </>
}
```

### Relevant Files
- `backend/src/services/weather-codes.ts` — fonte canônica das chaves `apiLabels.*` (não modificar)
- `backend/src/services/weather-service.ts` — label `Localização atual` deve existir em `apiLabels`
- `frontend/src/lib/format.ts` — `formatWeekday` hoje hardcoded `'pt-BR'`
- `frontend/src/services/weather-api.ts` — `ERROR_MESSAGE` com 3 strings PT
- `frontend/src/components/detailed-metrics-card.tsx` — `UV_COLOR` keyed on PT labels
- `frontend/src/components/air-quality-card.tsx` — `AQI_COLOR` keyed on PT labels

### Dependent Files
- `frontend/e2e/*.spec.ts` — asserções PT serão atualizadas na task 03
- `frontend/src/components/accessibility.test.tsx` — labels UV/AQI dependem de remap

### Related ADRs
- [ADR-001: Full UI i18n with PT-BR Default and Flag Switcher](../adrs/adr-001.md) — escopo completo de tradução
- [ADR-003: API Label Localization via PT-String Remap](../adrs/adr-003.md) — estratégia de labels dinâmicos

## Deliverables
- JSONs `pt-BR.json` e `en.json` completos (static + apiLabels)
- Zero strings user-visible hardcoded nos componentes/página listados
- `translateApiLabel` funcional com fallback para label original
- `LocaleSwitcher` visível e operacional na top bar
- Formatação de data/hora/cardinais respeitando locale ativo
- Suite Vitest atualizada com helper i18n
- Unit tests com 80%+ coverage **(REQUIRED)**
- Integration tests para fluxos de erro e labels API **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `translateApiLabel('Céu limpo')` com locale `en` retorna `Clear sky`
  - [ ] `translateApiLabel('label-desconhecido')` retorna string original inalterada
  - [ ] Teste de sync: cada label PT exportado de `weather-codes.ts` possui entrada em `apiLabels` de ambos JSONs
  - [ ] `formatWeekday(date, 'pt-BR')` retorna nome de dia em português; `'en'` retorna em inglês
  - [ ] Cardinais de vento: `'L'` em PT vs `'E'` (ou equivalente EN) conforme locale
  - [ ] `weather-api` com HTTP 404 lança `WeatherErrorCode` sem message PT embutida
  - [ ] `ErrorToast` com locale EN exibe texto de `errors.networkFailure` (ou chave equivalente)
  - [ ] `AirQualityCard` locale EN: label backend `Boa` renderiza `Good`
  - [ ] `WeatherHero` locale EN: condição API `Parcialmente nublado` renderiza tradução EN
  - [ ] Atualizar testes existentes: `city-search`, `daily-forecast-card` (`Hoje`), `hourly-forecast-card` (`Agora`), `weather-dashboard-page`, `accessibility`, etc.
- Integration tests:
  - [ ] `renderWithI18n(<WeatherDashboardPage />, { locale: 'en' })` exibe placeholder EN no estado idle
  - [ ] Troca de locale re-renderiza hero condition sem reload de página
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Grep por strings PT conhecidas nos componentes retorna zero ocorrências user-facing (exceto brand "Tempo" e chaves apiLabels)
- Modo EN exibe hero, erros, empty states e métricas inteiramente em inglês
- Modo PT-BR preserva copy atual equivalente
- Preferência de idioma independente de unidade °C/°F
