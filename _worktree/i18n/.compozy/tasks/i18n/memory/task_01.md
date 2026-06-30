# Task Memory: task_01.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Implement task_01 i18n foundation in frontend: install react-i18next/i18next, initialize PT-BR default locale with `wx-locale` persistence, sync `html[lang]`, add `useLocale`, `LocaleSwitcher`, base locale JSONs, `renderWithI18n`, and required tests. Auto-commit disabled.

## Important Decisions
- Keep this task scoped to infrastructure and isolated switcher; full top-bar composition and string migration remain task_02 unless needed for tests.
- Use synchronous `localStorage` read inside config initialization to avoid wrong-locale first render per ADR-002.

## Learnings
- Existing frontend has no i18n module yet; `main.tsx` renders `<App />` directly and `index.html` defaults to `lang="en"`.
- Existing action affordances use 46px glass controls and CSS in `frontend/src/index.css`; LocaleSwitcher should mirror this pattern.
- `tsc -b` includes test files in this repo, so `frontend/tsconfig.json` needs `vitest/globals` when adding new tests that use Vitest globals.
- Overall coverage initially had function coverage below 80%; small tests for already-counted helper files raised all-file function coverage above target without changing production behavior.

## Files / Surfaces
- Touched: `frontend/package.json`, `frontend/package-lock.json`, `frontend/tsconfig.json`, `frontend/index.html`, `frontend/src/main.tsx`, `frontend/src/index.css`.
- Created: `frontend/src/i18n/config.ts`, `frontend/src/i18n/locales/pt-BR.json`, `frontend/src/i18n/locales/en.json`, `frontend/src/i18n/translate-api-label.ts`, `frontend/src/i18n/test-utils.tsx`, `frontend/src/hooks/use-locale.ts`, `frontend/src/components/locale-switcher.tsx`.
- Tests added: config, LocaleSwitcher, translate-api-label stub, and small coverage-support tests for `health-api`, `utils`, and `Button`.

## Errors / Corrections
- `npm run lint` initially failed on a constant expression in `utils.test.ts`; fixed by using a variable.
- `npm run typecheck` initially failed because new tests use Vitest globals while tsconfig only included Node types; fixed by adding `vitest/globals`.
- `npm test -- --coverage` passes with 64 tests and all-file coverage: statements 86.83%, branches 82.53%, functions 80.7%, lines 86.83%.
- `npm run lint` exits 0 with one pre-existing warning in `frontend/src/components/ui/button.tsx` about `react-refresh/only-export-components`.
- `npm run typecheck` exits 0.
- `npm run build` exits 0; Vite emits a Browserslist/caniuse-lite staleness notice.

## Ready for Next Run
- Task 02 can import `LocaleSwitcher` from `frontend/src/components/locale-switcher.tsx` and `renderWithI18n` from `frontend/src/i18n/test-utils.tsx`.
- `translateApiLabel` currently returns the original label by design; task 02 owns full API-label mappings.
