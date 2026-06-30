# Task Memory: task_02.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Add visible °C/°F segmented toggle to sticky header; wire `UnitPreferenceProvider` into the dashboard page; `TopBar` gains optional `unitsSlot`. Display cards stay metric (Task 3 connects formatters).

## Important Decisions
- ADR-004 prose says mobile order "brand → units → actions → search", but its concrete CSS (`.wx-units{order:3}` + `.wx-search{order:4}`, default 0 for brand/actions) plus the design reference DOM source order (brand, search, units, actions) actually renders "brand → actions → units → search". Followed the CONCRETE CSS values (order:3 / order:4) since they are mandated verbatim by the task requirement and match the design reference exactly. Prose is an approximate description.
- Ported `.wx-units` from `docs/design/index.html` `.units`, mapping design vars to app vars: `--border`→`--wx-border`, `--muted`→`--wx-muted`, `--font`→`--wx-font`; kept `--surface`, `--surface-3`, `--fg`. Active segment uses class `on`.
- `UnitToggle` split into `UnitToggle` (group) + internal `UnitSegment` button to honor react skill ≤30 lines / explicit props. Native `<button>` covers Enter/Space keyboard activation (no custom keydown handler needed).
- Provider wraps the whole `.wx-app` tree; existing page tests render `<WeatherDashboardPage />` directly and keep working because the page now self-provides the context.

## Learnings
- New test numbering continues from #55 (highest existing) → use #56+.
- prefers-reduced-motion already handled globally (`* { transition/animation: none !important }` at index.css ~249); selected state is class-based, not animation-based, so no extra work needed.

## Files / Surfaces
- NEW: `frontend/src/components/unit-toggle.tsx`, `frontend/src/components/unit-toggle.test.tsx`
- MOD: `frontend/src/components/top-bar.tsx` (unitsSlot), `frontend/src/index.css` (.wx-units + mobile order), `frontend/src/pages/weather-dashboard-page.tsx` (provider + slot), `frontend/src/pages/weather-dashboard-page.test.tsx` (toggle/persistence)

## Errors / Corrections

## Ready for Next Run
- Task 3 will pass `unitSystem` from `useUnitPreference()` into formatters across the 6 display surfaces; cards still show metric after this task.
