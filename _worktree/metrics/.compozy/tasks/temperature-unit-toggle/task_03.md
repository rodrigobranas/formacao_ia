---
status: completed
title: Display surfaces and end-to-end integration
type: frontend
complexity: high
dependencies:
  - task_01
  - task_02
---

# Task 3: Display surfaces and end-to-end integration

## Overview

Connect all in-scope dashboard surfaces to the unit preference context so toggling °C/°F instantly converts every temperature, wind, precipitation, and pressure reading—including SVG curve scales and range-bar positioning—without refetching weather data. This task completes the PRD F2 inventory and validates the full user journey.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST call `useUnitPreference()` in each in-scope display component and pass `unitSystem` to formatters
- MUST update `WeatherHero` for main temperature, máx/mín, and sensação térmica readings
- MUST update `HeroQuickStats` for sensação (temperature) and vento (speed + unit label)
- MUST update `HourlyForecastCard` so per-hour temperature labels AND SVG curve Y-scale use converted temperatures
- MUST update `DailyForecastCard` so low/high labels AND range bar positioning use converted temperatures
- MUST update `DetailedMetricsCard` for sensação, real temperature, vento, rajadas, precipitação, and pressão; MUST remove hardcoded `'hPa'` and `'mm'` unit strings
- MUST NOT convert out-of-scope readings: percentages, UV, AQI, cardinal direction, condition labels, times
- MUST use consistent rounding via `units.ts` / `format.ts` — no inline conversion math in JSX
- MUST replace API-driven `windUnit` prop usage with client-side label logic when imperial is active
- SHOULD add optional Playwright E2E spec for toggle persistence journey if time permits
</requirements>

## Subtasks
- [x] 3.1 Wire WeatherHero and HeroQuickStats to unitSystem formatters
- [x] 3.2 Wire HourlyForecastCard labels and curve Y-scale to converted temperatures
- [x] 3.3 Wire DailyForecastCard labels and range bar math to converted temperatures
- [x] 3.4 Wire DetailedMetricsCard for all five metric types with imperial labels
- [x] 3.5 Extend component tests with at least one imperial assertion per in-scope card
- [x] 3.6 Add full dashboard integration test: toggle °F updates all surfaces; new search respects active unit
- [ ] 3.7 (Optional) Add Playwright E2E toggle persistence spec

## Implementation Details

See TechSpec **Impact Analysis** table for the complete surface inventory. See PRD F2 in-scope/out-of-scope table for QA checklist. Critical risk: hourly curve and daily range bar currently use raw Celsius values for positioning—both MUST convert before scale/range calculations.

Current call sites bypass unit preference:

```typescript
// hourly-forecast-card.tsx — curve uses raw Celsius
buildCurve(hours.map(h => h.temperature))

// detailed-metrics-card.tsx — hardcoded units
formatMeasure(pressure, 'hPa')
formatMeasure(precipitation, 'mm')
```

After this task, all in-scope values route through formatters with `unitSystem` from context. `aria-live="polite"` regions on temperature displays should reflect new values on toggle without extra work if formatters drive the text.

Surfaces explicitly out of scope: `SunArcCard`, `AirQualityCard`, `ApiStatusPill`, percentages, UV, AQI.

### Relevant Files
- `frontend/src/components/weather-hero.tsx` — hero temp, hi/lo, apparent; delegates to HeroQuickStats
- `frontend/src/components/hero-quick-stats.tsx` — apparent temp and wind (no dedicated test file; covered via hero tests)
- `frontend/src/components/hourly-forecast-card.tsx` — labels + SVG curve Y-scale
- `frontend/src/components/daily-forecast-card.tsx` — min/max labels + range bar positioning
- `frontend/src/components/detailed-metrics-card.tsx` — temp, wind, gusts, precip, pressure with hardcoded units
- `frontend/src/pages/weather-dashboard-page.tsx` — passes `windUnit` from API; may simplify after client-side labels
- `frontend/src/lib/units.ts` — `convertTemperature()` for curve/bar positioning (from Task 1)
- `frontend/src/lib/format.ts` — unit-aware formatters (from Task 1)
- `frontend/src/hooks/use-unit-preference.ts` — test wrapper export for component tests
- `frontend/src/test/fixtures.ts` — `LONDON` fixture with metric values (21.4°C, 12 km/h, etc.)

### Dependent Files
- `frontend/src/components/weather-hero.test.tsx` — extend with imperial assertions
- `frontend/src/components/hourly-forecast-card.test.tsx` — extend with imperial label and curve tests
- `frontend/src/components/daily-forecast-card.test.tsx` — extend with imperial label and range bar tests
- `frontend/src/components/detailed-metrics-card.test.tsx` — extend with mph/in/inHg assertions
- `frontend/src/pages/weather-dashboard-page.test.tsx` — full toggle → all surfaces integration test
- `frontend/e2e/` — optional new toggle persistence spec

### Related ADRs
- [ADR-001: Global Header Toggle with Instant Unit Conversion](../adrs/adr-001.md) — full in-scope inventory, instant update, no loading state
- [ADR-003: Pure Conversion Module in lib/units.ts](../adrs/adr-003.md) — all paths through shared formatters; curve/bar use same convertTemperature
- [ADR-004: TopBar unitsSlot and Imperial Display Precision](../adrs/adr-004.md) — pressure 1 decimal inHg, precip 2 decimal inches

## Deliverables
- Updated `weather-hero.tsx`, `hero-quick-stats.tsx`, `hourly-forecast-card.tsx`, `daily-forecast-card.tsx`, `detailed-metrics-card.tsx`
- Extended test files for all five display components
- Full dashboard integration test in `weather-dashboard-page.test.tsx`
- Optional `frontend/e2e/unit-toggle.spec.ts`
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for global toggle conversion **(REQUIRED)**

## Tests
- Unit tests:
  - [x] WeatherHero with imperial context shows `70°` for 21.4°C fixture (not `21°`)
  - [x] WeatherHero hi/lo and apparent temperature reflect converted whole-degree values
  - [x] HeroQuickStats wind row shows `mph` suffix and converted speed when imperial active
  - [x] HourlyForecastCard hour label shows converted temperature (e.g., `70°` not `21°`)
  - [x] HourlyForecastCard SVG curve Y-coordinates differ between metric and imperial for same raw data
  - [x] DailyForecastCard min/max labels show converted values
  - [x] DailyForecastCard range bar width/position reflects converted min/max spread
  - [x] DetailedMetricsCard pressure shows `29.9 inHg` for 1013 hPa fixture
  - [x] DetailedMetricsCard precipitation shows `0.04 in` for 1 mm fixture
  - [x] DetailedMetricsCard gusts show mph when imperial active
  - [x] Null/missing values still render `—` placeholder in both unit systems
  - [x] Percentages, UV, AQI, and cardinal direction unchanged after toggle to imperial
- Integration tests:
  - [x] Toggle °F on loaded dashboard → hero, hourly, daily, and detailed cards all show imperial values in same render
  - [x] Toggle °F → no loading skeleton or error toast appears
  - [x] Search new city while °F active → returned data displays in Fahrenheit/imperial
  - [x] Reload browser with `{ temp: 'f' }` stored → all in-scope readings load in imperial
  - [x] Toggle back to °C → all in-scope readings revert to metric instantly
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- 100% of PRD F2 in-scope readings switch unit on toggle (manual QA checklist pass)
- No in-scope label remains in previous unit system after toggle
- Consistent rounding across all cards (same underlying value → same displayed number)
- Optional E2E spec passes if implemented
