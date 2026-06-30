# TechSpec: Global Temperature & Units Toggle

## Executive Summary

This feature adds a header °C/°F segmented toggle that converts all in-scope dashboard readings instantly on the client, without refetching weather data. The backend continues to serve Celsius/metric raw values from Open-Meteo; conversion and formatting happen in a new `lib/units.ts` module consumed by existing display formatters.

**Key decisions:** React Context (`UnitPreferenceProvider` + `useUnitPreference`) propagates preference to six display surfaces; `localStorage` key `wx:units` persists choice with Celsius default; `TopBar` gains an optional `unitsSlot` for layout placement per `DESIGN.md`.

**Primary trade-off:** Client-side conversion keeps the API unchanged and enables instant toggling, but every display surface must route through shared formatters—bypassing them risks inconsistent rounding or stale metric labels.

## System Architecture

### Component Overview

```
WeatherDashboardPage
├── UnitPreferenceProvider          ← reads/writes localStorage, holds unitSystem
│   ├── TopBar
│   │   ├── searchSlot (CitySearch)
│   │   ├── unitsSlot (UnitToggle)  ← NEW: between search and actions
│   │   └── actionsSlot (ApiStatusPill, GeolocationButton)
│   └── DashboardContent
│       ├── WeatherHero             ← temp, hi/lo, apparent
│       ├── HeroQuickStats          ← apparent temp, wind
│       ├── HourlyForecastCard      ← labels + SVG curve scale
│       ├── DailyForecastCard       ← lo/hi labels + range bar positions
│       └── DetailedMetricsCard     ← temp, wind, gusts, precip, pressure
```

**Data flow:**

1. Weather payload arrives in metric (unchanged API contract).
2. `UnitPreferenceProvider` exposes `unitSystem: 'metric' | 'imperial'`.
3. Display components call `useUnitPreference()` and pass `unitSystem` to formatters.
4. `UnitToggle` calls `setUnitSystem`; provider updates state + localStorage; all consumers re-render with converted values in the same frame.
5. No network request on toggle.

**External systems:** None. Backend and Open-Meteo integration remain unchanged.

## Implementation Design

### Core Interfaces

```typescript
// frontend/src/types/unit-system.ts
export type UnitSystem = 'metric' | 'imperial'
export type TempUnit = 'c' | 'f'

export type StoredUnitsPreference = {
  temp: TempUnit
}
```

```typescript
// frontend/src/lib/units.ts
export function convertTemperature(celsius: number | null, system: UnitSystem): number | null
export function convertWind(kmh: number | null, system: UnitSystem): number | null
export function convertPrecipitation(mm: number | null, system: UnitSystem): number | null
export function convertPressure(hpa: number | null, system: UnitSystem): number | null

export function temperatureUnitLabel(system: UnitSystem): string
export function windUnitLabel(system: UnitSystem): string
export function precipitationUnitLabel(system: UnitSystem): string
export function pressureUnitLabel(system: UnitSystem): string
```

```typescript
// frontend/src/hooks/use-unit-preference.ts
type UnitPreferenceContextValue = {
  unitSystem: UnitSystem
  setUnitSystem: (system: UnitSystem) => void
}

export function UnitPreferenceProvider({ children }: { children: React.ReactNode }): JSX.Element
export function useUnitPreference(): UnitPreferenceContextValue
```

Conversion factors and rounding (single source of truth in `units.ts`):

| Function | Metric input | Imperial output | Rounding |
|----------|--------------|-----------------|----------|
| `convertTemperature` | °C | °F (`c × 9/5 + 32`) | `Math.round` |
| `convertWind` | km/h | mph (`× 0.621371`) | `Math.round` |
| `convertPrecipitation` | mm | in (`× 0.0393701`) | 2 decimal places |
| `convertPressure` | hPa | inHg (`× 0.02953`) | 1 decimal place |

Updated formatters in `format.ts`:

```typescript
export function formatTemperature(celsius: number | null, system: UnitSystem = 'metric'): string
export function formatMeasure(value: number | null, unit: string, system?: UnitSystem, kind?: 'wind' | 'precip' | 'pressure'): string
```

`formatMeasure` accepts raw metric values and applies conversion when `system === 'imperial'` based on `kind`.

### Data Models

**No backend changes.** Existing types remain the source of truth for raw values:

| Type | File | Relevant fields (always metric) |
|------|------|--------------------------------|
| `CurrentWeather` | `types/current-weather.ts` | `temperature`, `apparent_temperature`, `wind_speed`, `wind_gusts`, `pressure`, `precipitation` |
| `HourlyForecast` | `types/hourly-forecast.ts` | `temperature` |
| `DailyForecast` | `types/daily-forecast.ts` | `temp_min`, `temp_max` |
| `WeatherPayload` | `types/weather-payload.ts` | `units` field ignored for display labels when imperial active |

**Client storage:**

| Key | Shape | Default |
|-----|-------|---------|
| `wx:units` | `{ temp: 'c' \| 'f' }` | `{ temp: 'c' }` |

Mapping: `temp: 'c'` → `UnitSystem.metric`; `temp: 'f'` → `UnitSystem.imperial`. Wind, precipitation, and pressure follow the active system (no independent wind toggle in MVP).

### API Endpoints

**No new or modified endpoints.** Unit preference is client-side only per PRD constraints.

## Integration Points

Not applicable. The feature does not integrate with external services beyond the existing Open-Meteo pipeline, which continues to fetch Celsius/km/h upstream.

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|-----------|-------------|---------------------|-----------------|
| `lib/units.ts` | new | Pure conversion + label helpers | Create with unit tests |
| `lib/format.ts` | modified | Accept `unitSystem`; delegate to `units.ts` | Update signatures; extend tests |
| `types/unit-system.ts` | new | Shared `UnitSystem` type | Create |
| `hooks/use-unit-preference.ts` | new | Context + localStorage persistence | Create with hook tests |
| `components/unit-toggle.tsx` | new | Segmented °C/°F control | Create with a11y tests |
| `components/top-bar.tsx` | modified | Add `unitsSlot` prop | Render between search and actions |
| `index.css` | modified | `.wx-units` styles + mobile flex order | Port from design reference |
| `pages/weather-dashboard-page.tsx` | modified | Wrap with provider; wire toggle | Compose `unitsSlot` |
| `components/weather-hero.tsx` | modified | Pass `unitSystem` to formatters | Update tests for °F |
| `components/hero-quick-stats.tsx` | modified | Convert apparent temp + wind | Update tests |
| `components/hourly-forecast-card.tsx` | modified | Labels + curve Y-scale use converted temps | Update tests |
| `components/daily-forecast-card.tsx` | modified | Labels + range bar use converted temps | Update tests |
| `components/detailed-metrics-card.tsx` | modified | Temp, wind, gusts, precip, pressure | Remove hardcoded `hPa`/`mm` |
| Backend (`/api/weather`) | none | Unchanged | No action |
| `frontend/e2e/` | modified (optional) | Toggle persistence journey | Add if time permits |

**Out of scope (no changes):** `SunArcCard`, `AirQualityCard`, percentages, UV, AQI, cardinal direction, condition labels, API status pill.

## Testing Approach

### Unit Tests

| Target | Scenarios |
|--------|-----------|
| `lib/units.test.ts` | Conversion factors; null/NaN → null; rounding boundaries (e.g., 21°C → 70°F, 1013 hPa → 29.9 inHg, 1 mm → 0.04 in) |
| `lib/format.test.ts` | Existing Celsius tests preserved; imperial variants for each formatter |
| `hooks/use-unit-preference.test.ts` | Default metric; toggle to imperial; localStorage read on mount; write on change; corrupt/missing storage fallback |
| `components/unit-toggle.test.tsx` | Click °F/°C; `aria-pressed`; keyboard activation |
| Display components | At least one imperial assertion per in-scope card (extend existing test files) |

Mock `localStorage` via Vitest (`vi.stubGlobal` or setup helper). Wrap components under test with `UnitPreferenceProvider`.

### Integration Tests

| Target | Scenarios |
|--------|-----------|
| `weather-dashboard-page.test.tsx` | Toggle °F → hero shows converted temp; reload preference restored (mock localStorage); new search respects active unit |
| `weather-hero.test.tsx` | Wind label switches km/h ↔ mph |

No backend integration tests required.

## Development Sequencing

### Build Order

1. **`types/unit-system.ts` + `lib/units.ts` + tests** — no dependencies; establishes conversion contract.
2. **Extend `lib/format.ts` + tests** — depends on step 1.
3. **`use-unit-preference` hook + provider + tests** — depends on step 1 for type imports.
4. **`UnitToggle` component + tests** — depends on step 3.
5. **`TopBar` `unitsSlot` + `.wx-units` CSS** — no conversion dependency; can parallelize with step 4.
6. **Wire `WeatherDashboardPage`** (provider, toggle in `unitsSlot`) — depends on steps 3, 4, 5.
7. **Update display components** (hero → quick stats → hourly → daily → detailed) — depends on steps 2, 6.
8. **Page integration tests** — depends on step 7.
9. **Optional E2E toggle spec** — depends on step 7.

### Technical Dependencies

- Design tokens and `.wx-units` CSS from `docs/design/index.html` and `DESIGN.md`.
- No infrastructure, backend deploy, or external API changes.

## Monitoring and Observability

Not applicable for this client-only preference feature. No server metrics or alerts required.

Optional dev-only: log localStorage write failures in the provider catch block (silent fallback to in-memory state already planned).

## Technical Considerations

### Key Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| React Context for preference | Global instant update across 6+ surfaces | All consumers re-render on toggle (acceptable) |
| `lib/units.ts` separate from `format.ts` | Testable pure conversions; single rounding source | Two files for display math |
| Client-only conversion | No API change; instant toggle | All surfaces must use formatters |
| `unitsSlot` on TopBar | Matches design flex order; keeps TopBar presentational | One new prop |
| Pressure 1 decimal, precip 2 decimal | Industry-standard imperial display | Differs from whole-degree temp rounding |
| `wx:units` storage key | Matches design reference prototype | Key name is feature-specific |

### Known Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missed surface shows metric after toggle | Medium | Impact table + QA checklist from PRD F2 |
| Hourly curve / daily bar use raw Celsius for positioning | Medium | Explicit requirement in card implementation; test SVG path with imperial |
| Inconsistent rounding between cards | Low | All paths through `units.ts` |
| localStorage unavailable (private mode) | Low | try/catch; default Celsius; in-session toggle still works |
| Test setup missing provider | Medium | Test helper wrapper exported from hook module |

## Architecture Decision Records

- [ADR-001: Global Header Toggle with Instant Unit Conversion](adrs/adr-001.md) — Product decision: single header toggle, full metric conversion, Celsius default, client persistence; rejects phased temp-only, locale default, and dual-display.
- [ADR-002: React Context for Unit Preference Propagation](adrs/adr-002.md) — `UnitPreferenceProvider` + `useUnitPreference()` for atomic cross-dashboard updates; rejects prop drilling and unsynced standalone hooks.
- [ADR-003: Pure Conversion Module in lib/units.ts](adrs/adr-003.md) — Conversion math isolated from formatters; `format.ts` delegates with `unitSystem` parameter; rejects monolithic format.ts and full format.ts deprecation.
- [ADR-004: TopBar unitsSlot and Imperial Display Precision](adrs/adr-004.md) — Optional `unitsSlot` between search and actions; pressure at 1 decimal inHg, precipitation at 2 decimal inches; rejects embedding toggle in actionsSlot.
