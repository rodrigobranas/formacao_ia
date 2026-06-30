# Task Memory: task_03.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Wire all PRD F2 in-scope dashboard display surfaces to `useUnitPreference()` so °C/°F toggles convert temperatures, wind, precipitation, and pressure instantly without refetching; extend component/page tests and update task tracking after verification.

## Important Decisions
- Use existing Task 01 contracts: display labels through `formatTemperature`/`formatMeasure`, curve and range-bar math through `convertTemperature`.
- Removed `windUnit` props from `WeatherHero`, `HeroQuickStats`, and `DetailedMetricsCard`; wind labels now come from `windUnitLabel(unitSystem)`.

## Learnings
- Pre-change display surfaces still use metric/raw values: hero and quick stats ignore unit context; hourly curve uses raw Celsius; daily bar range uses raw Celsius; detailed metrics uses API wind unit and hardcoded pressure/precip units.
- No `CLAUDE.md` exists under the worktree; applicable local guidance is `AGENTS.md` plus the PRD/TechSpec/ADRs.
- Final validation chain after all code changes exited 0: `npm run typecheck && npm run lint && npm test -- --coverage && npm run build`. Coverage: 82.7% statements, 92 tests passed. Lint still reports the known unrelated `src/components/ui/button.tsx` React Refresh warning.

## Files / Surfaces
- Touched surfaces: `weather-hero.tsx`, `hero-quick-stats.tsx`, `hourly-forecast-card.tsx`, `daily-forecast-card.tsx`, `detailed-metrics-card.tsx`, `weather-dashboard-page.tsx`, related component tests, `accessibility.test.tsx`, and `weather-dashboard-page.test.tsx`.

## Errors / Corrections
- Initial focused tests caught two expectation issues only: page fixture daily hi/lo is 22/12 C (not standalone hero 24/14 C), and daily rain probability appears in multiple rows. Corrected tests to match fixture behavior.
- Self-review moved `useUnitPreference()` into exported `WeatherHero` to satisfy the literal in-scope component requirement.

## Ready for Next Run
- Task implementation and verification completed; tracking files should reflect completed status. Automatic commit remains disabled.
