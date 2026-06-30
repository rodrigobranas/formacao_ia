# Task Memory: task_01.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Build client-side unit-conversion foundation + preference state (no UI/display changes).
- Deliver types, pure `units.ts`, extended formatters, `UnitPreferenceProvider`/`useUnitPreference` with `wx:units` localStorage persistence, plus tests ≥80%.

## Important Decisions
- `types/unit-system.ts` holds 3 cohesive types (techspec Core Interfaces mandates it) — overrides generic one-type-per-file standard.
- `formatMeasure(value, unit, system?, kind?)` keeps techspec 4-param signature — explicit task test calls it with 4 args; overrides generic ≤3-param standard.
- `formatTemperature` rounds Celsius to whole degree THEN converts, so `formatTemperature(21.4,'imperial')==='70°'` (precise 21.4°C=70.52°F→71, but whole-degree display semantics give 21°C→70°F) while preserving existing `20.6→21°`. `convertTemperature` stays pure (convert-then-Math.round), used directly for positioning in later tasks.
- Hook file is `.ts` (per deliverable path); provider uses `React.createElement` (no JSX) so it compiles as `.ts`. Test wrapper exported as `UnitPreferenceWrapper` (usable via renderHook `{ wrapper }`).
- Conversion factors: wind ×0.621371 (Math.round), precip ×0.0393701 (2dp), pressure ×0.02953 (1dp), temp ×9/5+32 (Math.round). Metric = pass-through.

## Learnings
- `frontend/` had no `node_modules`; ran `npm install` to enable vitest.
- Bash tooling: an RTK passthrough wrapper garbles vitest stdout — run via `./node_modules/.bin/vitest run ... > logfile 2>&1` and grep the log.

## Files / Surfaces
- NEW: types/unit-system.ts, lib/units.ts, lib/units.test.ts, hooks/use-unit-preference.ts, hooks/use-unit-preference.test.ts
- EDIT: lib/format.ts (+unitSystem on formatTemperature/formatMeasure), lib/format.test.ts (+imperial cases)

## Errors / Corrections

## Ready for Next Run
- Task 2 consumes `useUnitPreference`/`UnitPreferenceProvider`; Task 3 display surfaces pass `unitSystem` to formatters and call `convertTemperature` for positioning.
