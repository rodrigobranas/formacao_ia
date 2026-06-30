---
status: completed
title: Unit conversion foundation and preference state
type: frontend
complexity: high
dependencies: []
---

# Task 1: Unit conversion foundation and preference state

## Overview

Establish the client-side conversion contract and global preference state that every dashboard surface will consume. This task creates pure conversion helpers, extends existing formatters to accept a `UnitSystem`, and introduces a React Context provider with `localStorage` persistence—without any UI changes yet.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `UnitSystem`, `TempUnit`, and `StoredUnitsPreference` types in `frontend/src/types/unit-system.ts`
- MUST create `frontend/src/lib/units.ts` with pure conversion functions (`convertTemperature`, `convertWind`, `convertPrecipitation`, `convertPressure`) and unit-label helpers; null in → null out; rounding per TechSpec "Conversion factors and rounding" table
- MUST extend `formatTemperature` and `formatMeasure` in `frontend/src/lib/format.ts` to accept optional `unitSystem` (default `'metric'`) and delegate conversion to `units.ts`; percent/cardinal/time formatters MUST remain unchanged
- MUST create `UnitPreferenceProvider` and `useUnitPreference()` in `frontend/src/hooks/use-unit-preference.ts` exposing `unitSystem` and `setUnitSystem`
- MUST persist preference to `localStorage` key `wx:units` with shape `{ temp: 'c' | 'f' }`; default to Celsius/metric when key is absent or parse fails
- MUST map `temp: 'c'` → `'metric'` and `temp: 'f'` → `'imperial'`; wind, precipitation, and pressure follow the active system automatically
- MUST wrap localStorage read/write in try/catch with silent fallback to in-memory state when storage is unavailable
- MUST export a test helper wrapper from the hook module for wrapping components under test
- MUST NOT modify backend, display components, or TopBar in this task
</requirements>

## Subtasks
- [x] 1.1 Define shared unit-system types
- [x] 1.2 Implement pure conversion and label helpers with unit tests
- [x] 1.3 Extend formatters to accept `unitSystem` while preserving existing Celsius behavior
- [x] 1.4 Implement preference context with localStorage persistence and hook tests
- [x] 1.5 Export test wrapper helper for downstream component tests

## Implementation Details

See TechSpec sections **Core Interfaces**, **Conversion factors and rounding**, and **Data Models** for interface shapes and rounding rules. See ADR-003 for separation of `units.ts` from `format.ts`; see ADR-002 for Context + storage design.

Current `format.ts` assumes Celsius/metric input with no conversion:

```typescript
export function formatTemperature(celsius: number | null): string
export function formatMeasure(value: number | null, unit: string): string
```

After this task, unit-sensitive formatters accept `unitSystem` and delegate to `units.ts`. No display component should import the hook yet—that wiring happens in Task 2.

### Relevant Files
- `frontend/src/lib/format.ts` — existing Celsius-only formatters to extend
- `frontend/src/lib/format.test.ts` — existing tests to preserve and extend with imperial cases
- `frontend/src/types/current-weather.ts` — raw metric fields (`temperature`, `wind_speed`, `pressure`, etc.) remain unchanged
- `docs/design/index.html` — reference for `wx:units` storage key and try/catch load/save pattern

### Dependent Files
- `frontend/src/lib/format.ts` — gains `unitSystem` parameter on unit-sensitive functions
- `frontend/src/hooks/use-unit-preference.ts` — new file consumed by Task 2 toggle and Task 3 display surfaces

### Related ADRs
- [ADR-002: React Context for Unit Preference Propagation](../adrs/adr-002.md) — Context shape, `wx:units` key, Celsius default
- [ADR-003: Pure Conversion Module in lib/units.ts](../adrs/adr-003.md) — conversion isolation, rounding rules, formatter delegation

## Deliverables
- `frontend/src/types/unit-system.ts`
- `frontend/src/lib/units.ts` with full conversion and label API
- `frontend/src/lib/units.test.ts`
- Updated `frontend/src/lib/format.ts` and `frontend/src/lib/format.test.ts`
- `frontend/src/hooks/use-unit-preference.ts` with provider, hook, and test wrapper export
- `frontend/src/hooks/use-unit-preference.test.ts`
- Unit tests with 80%+ coverage **(REQUIRED)**

## Tests
- Unit tests:
  - [x] `convertTemperature(21)` with imperial returns `70` (whole-degree rounding)
  - [x] `convertTemperature(null)` returns `null`
  - [x] `convertWind(10)` with imperial returns `6` (Math.round of km/h × 0.621371)
  - [x] `convertPrecipitation(1)` with imperial returns `0.04` (2 decimal places)
  - [x] `convertPressure(1013)` with imperial returns `29.9` (1 decimal place)
  - [x] Label helpers return `°`, `km/h`, `mm`, `hPa` for metric and `°`, `mph`, `in`, `inHg` for imperial
  - [x] `formatTemperature(21.4, 'imperial')` returns `70°`; existing Celsius tests unchanged with default param
  - [x] `formatMeasure(12, 'km/h', 'imperial', 'wind')` returns `7 mph` (rounded)
  - [x] Provider defaults to `'metric'` when localStorage is empty
  - [x] `setUnitSystem('imperial')` writes `{ temp: 'f' }` to `wx:units` and updates context
  - [x] Provider reads stored `{ temp: 'f' }` on mount and initializes as imperial
  - [x] Corrupt or invalid JSON in `wx:units` falls back to Celsius default
  - [x] localStorage throw on read/write falls back gracefully without crashing
- Integration tests:
  - [x] `useUnitPreference` hook test: toggle metric → imperial → metric updates `unitSystem` synchronously
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Conversion and formatting rules match TechSpec rounding table exactly
- Preference persists across provider remount when localStorage contains valid data
- No UI or display component files modified
