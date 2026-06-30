# Workflow Memory

Keep only durable, cross-task context here. Do not duplicate facts that are obvious from the repository, PRD documents, or git history.

## Current State
- Task 01 (conversion + preference foundation), Task 02 (header toggle UI + provider wiring), and Task 03 (display surfaces + end-to-end integration) implemented and verified.
- `UnitToggle` (`frontend/src/components/unit-toggle.tsx`) renders the °C/°F segmented control from `useUnitPreference()`; `UnitPreferenceProvider` wraps the `WeatherDashboardPage` tree; `TopBar` exposes optional `unitsSlot` between search and actions.
- Display cards now consume unit preference: hero, quick stats, hourly labels/curve, daily labels/range bars, and detailed metrics all convert through shared formatter/conversion contracts.

## Shared Decisions
- Conversion contract lives in `frontend/src/lib/units.ts` (pure). Factors: temp ×9/5+32 (Math.round); wind ×0.621371 (Math.round); precip ×0.0393701 (2dp); pressure ×0.02953 (1dp). Metric = pass-through (unrounded). All `convert*` are null/NaN-in → null-out.
- Preference state: `UnitPreferenceProvider` + `useUnitPreference()` in `frontend/src/hooks/use-unit-preference.ts`. localStorage key `wx:units`, shape `{ temp: 'c' | 'f' }`; `c`→metric, `f`→imperial; default metric on absent/corrupt/unexpected; read+write wrapped in try/catch. `UnitPreferenceWrapper` exported for tests.
- Formatter contract for Tasks 2/3 consumers:
  - `formatTemperature(celsius, system='metric')` rounds Celsius to whole degree THEN converts (so `21.4°C`→`70°F` not 71). Use for labels.
  - `formatMeasure(value, unit, system='metric', kind?: 'wind'|'precip'|'pressure')`: in imperial+kind it IGNORES `unit` and derives the imperial label from `kind`; metric uses the passed `unit`.
  - For SVG/curve positioning use `convertTemperature(rawCelsius, system)` directly (note: imperial output is whole-°F rounded per spec).

## Shared Learnings
- `frontend/` ships without `node_modules` — run `npm install` before any vitest/tsc/eslint run.

## Open Risks
- Pre-existing lint warning in `src/components/ui/button.tsx` (react-refresh/only-export-components) is unrelated to this feature; do not "fix" it as part of these tasks.

## Handoffs
- Task 02 wires `UnitPreferenceProvider` at page level and builds the toggle calling `setUnitSystem`.
- Task 03 removed API-driven `windUnit` display props from hero/quick stats/detailed metrics; wind labels are client-side via `windUnitLabel(unitSystem)`.
