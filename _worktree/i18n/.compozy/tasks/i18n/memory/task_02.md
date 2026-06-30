# Task Memory: task_02.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Implement full task 02 frontend i18n: static UI copy, API label remap, error-code UI translation, locale-aware formatting, LocaleSwitcher top-bar integration, and Vitest coverage.

## Important Decisions
- Existing task 01 infrastructure is present but minimal: provider/config/switcher/test helper exist, locale JSONs only include brand/locale keys, and `translateApiLabel` is still a passthrough.
- Daily forecast API data contains WMO codes but no API label field, so daily display will use localized frontend group labels derived from `groupForCode`; hero/UV/AQI use API-label remap at display boundaries.
- UV and AQI colors are now derived from numeric values instead of localized/PT labels, avoiding color-map coupling to display text.

## Learnings
- Initial grep confirms PT user-facing strings remain in listed components/page plus PT error messages in `weather-api.ts` and `use-weather.ts`.
- Initial targeted test command using `frontend/src/...` paths from the frontend cwd found no files; use `src/...` paths when running scoped Vitest commands inside `frontend/`.
- `translateApiLabel` must accept the active `t` function at React display boundaries because component tests use isolated i18n instances; the default singleton path remains for direct helper calls.
- Final source grep over `frontend/src/components`, `pages`, `hooks`, `services`, and `lib` found no known PT user-facing strings; remaining PT labels are in `frontend/src/test/fixtures.ts` as backend-contract mocks.

## Files / Surfaces
- Planned surfaces: `frontend/src/i18n/*`, listed components under `frontend/src/components`, `frontend/src/pages/weather-dashboard-page.tsx`, `frontend/src/lib/format.ts`, `frontend/src/lib/weather-code.ts`, `frontend/src/services/weather-api.ts`, `frontend/src/hooks/use-weather.ts`, and related tests.
- Touched implementation surfaces include locale JSONs, `translate-api-label.ts`, `format.ts`, `weather-code.ts`, `weather-api.ts`, `use-weather.ts`, `weather-api-error.ts`, translated components/cards/page, and i18n-aware tests.

## Errors / Corrections
- Corrected `WeatherApiError` constructor typing after optional messages initially inferred too narrowly.
- Corrected `translateApiLabel` to use the active component translator instead of only the global i18n singleton.
- Removed an unrelated lint warning by dropping the unused `buttonVariants` export from `components/ui/button.tsx`.

## Ready for Next Run
- Verification evidence: `npm test -- --coverage` passed 24 files / 76 tests with 86.54% statement coverage; `npm run lint`, `npm run typecheck`, and `npm run build` exited 0.
- Build emits the existing Browserslist/caniuse-lite age notice; no dependency metadata refresh was performed for this task.
- Task tracking updated: `task_02.md` status is `completed`, all subtasks are checked, and `_tasks.md` marks task 02 completed.
