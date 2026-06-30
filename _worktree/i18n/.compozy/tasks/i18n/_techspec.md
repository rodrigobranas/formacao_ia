# TechSpec: Internationalization (PT-BR / EN)

## Executive Summary

This feature adds client-side bilingual support (PT-BR and EN) to the weather dashboard SPA using **react-i18next**. Translations live in two flat JSON files bundled at build time. A flag-based language switcher in the top bar persists the user's explicit choice in `localStorage`; first-time visitors default to PT-BR with no browser-language auto-detection.

Static UI strings migrate from hardcoded JSX to `t()` calls. Dynamic labels from the backend API (weather conditions, UV, air quality) are localized on the frontend by **remapping PT label strings** to EN equivalents via an `apiLabels` translation namespace (ADR-003). Date/time formatting switches from hardcoded `'pt-BR'` to locale-aware `Intl` APIs driven by the active i18n language.

**Primary trade-off**: Using backend PT strings as i18n lookup keys avoids API changes and code/threshold duplication, but creates a coupling contract — any backend label rename requires a matching frontend translation key update.

## System Architecture

### Component Overview

```
main.tsx
  └─ I18nextProvider (i18n instance)
       └─ App → WeatherDashboardPage
            └─ TopBar
                 ├─ CitySearch, GeolocationButton, ApiStatusPill (translated)
                 └─ LocaleSwitcher (NEW) — flag toggle, persists locale

frontend/src/i18n/
  ├─ config.ts          — i18next init, localStorage read, lang sync
  ├─ translate-api-label.ts — PT-string → t() for API labels
  └─ locales/
       ├─ pt-BR.json     — all keys (static + apiLabels)
       └─ en.json

frontend/src/hooks/
  └─ use-locale.ts (NEW) — changeLanguage, current locale, aria helpers

frontend/src/lib/format.ts — accepts locale param, uses Intl
```

**Data flow on locale switch:**
1. User clicks flag in `LocaleSwitcher` → `i18n.changeLanguage('en')`
2. i18n writes `wx-locale` to localStorage
3. `config.ts` listener sets `document.documentElement.lang` to `'en'` or `'pt-BR'`
4. React re-renders all `useTranslation()` consumers instantly
5. Components displaying API labels call `translateApiLabel(payload.label)`
6. `format.ts` functions receive active locale for Intl formatting

**Boundaries:**
- Backend API contract unchanged — still returns PT labels
- Error messages resolved in frontend by `WeatherErrorCode` → i18n key (not backend error text)
- Brand name "Tempo" stays untranslated in both locales; tagline translates

## Implementation Design

### Core Interfaces

```typescript
// frontend/src/i18n/config.ts
export type AppLocale = 'pt-BR' | 'en';

export const LOCALE_STORAGE_KEY = 'wx-locale';
export const DEFAULT_LOCALE: AppLocale = 'pt-BR';
export const SUPPORTED_LOCALES: AppLocale[] = ['pt-BR', 'en'];

export function initI18n(): typeof i18n;
export function syncDocumentLang(locale: AppLocale): void;
```

```typescript
// frontend/src/i18n/translate-api-label.ts
export function translateApiLabel(label: string): string;
```

```typescript
// frontend/src/hooks/use-locale.ts
export function useLocale(): {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  localeLabel: string; // "Português (Brasil)" | "English" for aria
};
```

```typescript
// frontend/src/components/locale-switcher.tsx
export function LocaleSwitcher(): JSX.Element;
// Two toggle buttons (🇧🇷 / 🇺🇸) with aria-pressed, accessible names
```

### Data Models

**localStorage:**

| Key | Value | Default |
|-----|-------|---------|
| `wx-locale` | `'pt-BR'` \| `'en'` | absent → PT-BR |

**Translation JSON structure** (single flat namespace per locale):

```json
{
  "brand.tagline": "Open-Meteo",
  "search.placeholder": "Buscar cidade…",
  "errors.cityNotFound": "Cidade não encontrada.",
  "apiLabels.Céu limpo": "Céu limpo",
  "apiLabels.Chuva forte": "Chuva forte"
}
```

EN file mirrors keys; `apiLabels.*` values are English. Static keys use semantic dot notation; `apiLabels` uses PT backend strings as sub-keys.

**Air quality (simplified bilingual set):**

| PT (backend) | EN |
|--------------|-----|
| Boa | Good |
| Razoável | Fair |
| Moderada | Moderate |
| Ruim | Poor |
| Muito ruim | Very poor |
| Péssima | Hazardous |

Descriptions translate to plain-language equivalents matching simplified tone.

### API Endpoints

No changes. Existing endpoints retain current behavior:

- `GET /api/weather/search?q=` — unchanged
- `GET /api/weather?lat=&lon=` — unchanged; PT labels in response
- `GET /health` — unchanged

Frontend error mapping (`WeatherErrorCode`) moves from hardcoded PT strings in `weather-api.ts` to i18n keys resolved at throw/display time.

## Integration Points

None external. i18n is self-contained in the frontend bundle.

## Impact Analysis

| Component | Impact | Description / Risk | Action |
|-----------|--------|-------------------|--------|
| `frontend/src/main.tsx` | modified | Wrap with I18nextProvider | Init i18n before render |
| `frontend/index.html` | modified | Default `lang="pt-BR"` | Sync via JS on load |
| `frontend/src/i18n/*` | new | Config, locales, helpers | Create module |
| `frontend/src/hooks/use-locale.ts` | new | Locale state API | Create |
| `frontend/src/components/locale-switcher.tsx` | new | Top-bar control | Create |
| `frontend/src/components/top-bar.tsx` | modified | Brand tagline via t(); slot for switcher | Translate + compose |
| ~15 component files | modified | Replace hardcoded PT strings | Inventory + t() |
| `frontend/src/pages/weather-dashboard-page.tsx` | modified | Errors, empty states, compose switcher | Translate |
| `frontend/src/services/weather-api.ts` | modified | Error codes only, no PT strings | Use i18n or pass codes up |
| `frontend/src/lib/format.ts` | modified | Locale-aware Intl | Add locale param from i18n |
| `frontend/src/lib/weather-code.ts` | modified | Remove/replace PT GROUP_LABEL | Use i18n or API remap |
| `backend/src/services/weather-codes.ts` | unchanged | PT labels remain source keys | Document coupling |
| Vitest tests (18 files) | modified | Wrap with i18n test helper | Update assertions |
| Playwright E2E (9 specs) | modified | Locale switch + EN assertions | Add locale setup helper |

## Testing Approach

### Unit Tests

- **i18n config**: default locale PT-BR; reads localStorage; falls back when invalid
- **translateApiLabel**: every backend PT label maps to EN; unknown label returns original
- **format.ts**: weekday/time formatting differs between pt-BR and en
- **LocaleSwitcher**: aria-pressed, keyboard operable
- **Component tests**: wrap with `renderWithI18n(ui, { locale: 'en' })` helper
- **Backend label sync test**: import PT labels from backend weather-codes constants (or snapshot list) and assert all exist in `apiLabels` keys

### Integration / E2E

- Playwright helper: `setLocale(page, 'en')` via localStorage before navigation
- Existing main-flow spec runs in PT-BR (default)
- New spec: switch to EN, verify hero/search/error strings in English
- Accessibility spec: verify `html[lang]` matches active locale after switch
- Manual QA checklist: both locales side-by-side, persistence across reload (10 trials per PRD)

## Development Sequencing

### Build Order

1. **i18n infrastructure** — install deps, `config.ts`, locale JSON scaffolds, `main.tsx` provider. *No dependencies.*
2. **use-locale hook + LocaleSwitcher** — depends on step 1.
3. **Static string migration** — translate all component/page strings; depends on step 1.
4. **Error message i18n** — refactor `weather-api.ts` to error codes only; translate in UI layer; depends on step 1.
5. **apiLabels namespace + translateApiLabel** — map all backend PT labels; depends on step 1.
6. **Display-layer API label integration** — hero, metrics, air quality cards use translateApiLabel; depends on step 5.
7. **Locale-aware formatting** — update `format.ts`, pass locale from i18n; depends on step 1.
8. **Top bar integration** — wire LocaleSwitcher into WeatherDashboardPage actions slot; depends on steps 2, 3.
9. **html lang + index.html default** — depends on step 1.
10. **Test updates** — i18n test helper, unit + E2E; depends on steps 3–9.
11. **QA pass** — manual checklist both locales; depends on step 10.

### Technical Dependencies

- `npm install i18next react-i18next` in frontend
- Complete string inventory before step 3 (can run in parallel with step 1)
- Backend label list from `weather-codes.ts` required before step 5

## Monitoring and Observability

Not applicable for MVP (local dev sandbox). No production telemetry planned.

## Technical Considerations

### Key Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| react-i18next | Industry standard, JSON resources, instant switch | +2 deps |
| Flat JSON per locale | Simple for 2 locales, ~150 keys | No namespace splitting |
| PT-string API remap | No backend change; stakeholder choice | Coupling to backend PT wording |
| Brand "Tempo" fixed | Product name consistency | EN users see Portuguese name |
| Simplified air quality | Sandbox clarity over regulatory accuracy | Not EPA/CONAMA compliant |
| localStorage `wx-locale` | Matches PRD persistence | Cleared storage resets to PT-BR |
| No browser lang detection | PRD: PT-BR default on first visit | Ignores OS language preference |

### Known Risks

| Risk | Mitigation |
|------|------------|
| Missed hardcoded strings | Exhaustive grep + manual QA both locales |
| EN text overflow in glass UI | Test narrow viewports; flex layouts per DESIGN.md |
| Backend label rename | Unit test sync check on apiLabels keys |
| Test suite breakage | Introduce renderWithI18n early in step 10 |
| Flag emoji a11y | aria-label with full language name per PRD |

## Architecture Decision Records

- [ADR-001: Full UI i18n with PT-BR Default and Flag Switcher](adrs/adr-001.md) — Complete bilingual UI with flag switcher and browser persistence; rejects URL routing and MVP-only scope.
- [ADR-002: react-i18next as Frontend i18n Library](adrs/adr-002.md) — Adopts react-i18next over react-intl and custom hooks for Vite/React SPA.
- [ADR-003: API Label Localization via PT-String Remap](adrs/adr-003.md) — Frontend remaps backend PT label strings to EN; rejects code-based lookup and backend lang param.
