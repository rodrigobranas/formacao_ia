# Task Memory: task_03.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Execute final i18n QA task: add Playwright locale helper, add dedicated locale-switch/persistence/lang E2E coverage, update existing E2E specs for PT-BR default and EN explicit flows, run manual PRD checklist, and verify Vitest coverage plus Playwright suite.

## Important Decisions
- Scope remains frontend/E2E only unless QA exposes a minimal layout or a11y production regression; backend and lazy-loaded locale bundles are out of scope.
- `frontend/playwright.config.ts` now starts Vite on strict port `5174` with `reuseExistingServer: false` so E2E tests cannot accidentally target another app on `5173`.
- The one production fix from QA is display-boundary localization for the geolocation label `Localização atual` in `WeatherHero`; backend responses remain unchanged.

## Learnings
- Shared workflow memory is empty at task start.
- Task 02 memory reports i18n implementation is already present, with Vitest coverage passing at 86.54% and task 02 tracking completed.
- Initial focused Playwright run reused an unrelated app already listening on `localhost:5173` because the E2E config allowed frontend server reuse; task_03 now isolates E2E frontend on strict port `5174`.
- Full Playwright initially exposed an EN regression where geolocation success displayed `Localização atual`; fixed by translating `location.name` through `translateApiLabel` in `WeatherHero`.

## Files / Surfaces
- Planned surfaces: `frontend/e2e/support/locale.ts`, `frontend/e2e/support/actions.ts`, the 9 existing Playwright specs, and a new locale switch spec.
- Added `frontend/playwright.config.ts` to the working set to avoid false E2E results from a pre-existing dev server on port 5173.
- Touched surfaces: new `frontend/e2e/support/locale.ts`, new `frontend/e2e/locale-switch.spec.ts`, updated Playwright specs/actions/config, and `frontend/src/components/weather-hero.tsx` plus its test.

## Errors / Corrections
- Corrected E2E environment after first focused run hit an unrelated app on port 5173.
- Corrected EN geolocation display from `Localização atual` to `Current location`.

## Ready for Next Run
- Verification evidence: `npm run test:e2e` passed 21/21; `npm test -- --coverage` passed 24 files / 77 tests with 86.6% statement coverage; `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check` exited 0.
- Manual PRD checklist evidence is covered by E2E assertions: first visit PT-BR active, EN switch instant/no reload/no spinner, 10 reload persistence trials, clearing localStorage returns PT-BR, keyboard Enter/Space switch, `html[lang]` and `aria-pressed`, EN visible string scan, EN mobile/desktop no overflow.
- No automatic commit per run configuration.
