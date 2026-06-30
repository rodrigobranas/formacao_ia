---
status: completed
title: Header toggle UI and dashboard wiring
type: frontend
complexity: medium
dependencies:
  - task_01
---

# Task 2: Header toggle UI and dashboard wiring

## Overview

Add the visible °C/°F segmented control to the sticky header and wire it into the dashboard page tree via React Context. After this task the toggle is discoverable, keyboard-operable, and persists the user's choice—display cards still show metric values until Task 3 connects formatters.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `frontend/src/components/unit-toggle.tsx` as a segmented control with exactly two segments: °C and °F
- MUST use `role="group"` with `aria-label="Unidade de temperatura"` and `aria-pressed` on each segment button reflecting selected state
- MUST call `setUnitSystem` from `useUnitPreference()` on segment click; MUST support keyboard activation (Enter/Space)
- MUST add optional `unitsSlot?: ReactNode` prop to `TopBar`, rendered between `{searchSlot}` and the `wx-actions` container
- MUST add `.wx-units` styles to `frontend/src/index.css` ported from design reference (46px height, glass track, elevated active segment)
- MUST set mobile flex order per ADR-004: `.wx-units { order: 3 }` alongside existing `.wx-search { order: 4 }` at 540px breakpoint
- MUST wrap `WeatherDashboardPage` tree with `UnitPreferenceProvider`
- MUST pass `<UnitToggle />` into `TopBar` via `unitsSlot`
- MUST respect `prefers-reduced-motion` — selected state MUST NOT depend on animation
- MUST NOT update display card formatters in this task (deferred to Task 3)
</requirements>

## Subtasks
- [x] 2.1 Create accessible UnitToggle component with glass segmented styling
- [x] 2.2 Extend TopBar with unitsSlot between search and actions
- [x] 2.3 Add .wx-units CSS and mobile flex order to index.css
- [x] 2.4 Wrap WeatherDashboardPage with UnitPreferenceProvider and wire unitsSlot
- [x] 2.5 Add component and page-level tests for toggle visibility, interaction, and persistence

## Implementation Details

See TechSpec **Component Overview** diagram and **Development Sequencing** steps 4–6. See `DESIGN.md` Units Toggle and Top Bar sections for visual spec. See ADR-004 for slot placement and CSS precision decisions.

Current `TopBar` accepts only two slots:

```typescript
type TopBarProps = {
  searchSlot: ReactNode
  actionsSlot: ReactNode
}
```

After this task, `unitsSlot` sits between search and actions. `WeatherDashboardPage` composition becomes:

```
UnitPreferenceProvider
└── TopBar
    ├── searchSlot → CitySearch
    ├── unitsSlot → UnitToggle        ← NEW
    └── actionsSlot → ApiStatusPill + GeolocationButton
└── DashboardContent (unchanged metric display until Task 3)
```

Reference CSS and markup patterns live in `docs/design/index.html` (`.units` → `.wx-units`).

### Relevant Files
- `frontend/src/components/top-bar.tsx` — layout shell to extend with `unitsSlot`
- `frontend/src/pages/weather-dashboard-page.tsx` — page root for provider wrap and slot composition
- `frontend/src/index.css` — existing `.wx-topbar`, `.wx-search` mobile order rules
- `frontend/src/hooks/use-unit-preference.ts` — hook and provider from Task 1
- `docs/design/index.html` — reference segmented control markup and CSS
- `DESIGN.md` — Top Bar and Units Toggle component spec

### Dependent Files
- `frontend/src/components/top-bar.tsx` — gains `unitsSlot` prop
- `frontend/src/pages/weather-dashboard-page.tsx` — provider wrap and toggle slot wiring
- `frontend/src/index.css` — new `.wx-units` rules and mobile order

### Related ADRs
- [ADR-001: Global Header Toggle with Instant Unit Conversion](../adrs/adr-001.md) — single header toggle, Celsius default, instant update requirement
- [ADR-002: React Context for Unit Preference Propagation](../adrs/adr-002.md) — provider at page level
- [ADR-004: TopBar unitsSlot and Imperial Display Precision](../adrs/adr-004.md) — slot placement, a11y attributes, mobile flex order

## Deliverables
- `frontend/src/components/unit-toggle.tsx`
- `frontend/src/components/unit-toggle.test.tsx`
- Updated `frontend/src/components/top-bar.tsx`
- Updated `frontend/src/index.css` with `.wx-units` styles
- Updated `frontend/src/pages/weather-dashboard-page.tsx` with provider and toggle wiring
- Updated `frontend/src/pages/weather-dashboard-page.test.tsx` with toggle/persistence smoke tests
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for toggle wiring **(REQUIRED)**

## Tests
- Unit tests:
  - [x] UnitToggle renders °C and °F segments with °C selected when `unitSystem` is metric
  - [x] Clicking °F segment calls `setUnitSystem('imperial')`
  - [x] Clicking °C segment when imperial active calls `setUnitSystem('metric')`
  - [x] Selected segment has `aria-pressed="true"`; inactive segment has `aria-pressed="false"`
  - [x] °F segment activates via keyboard Enter key
  - [x] Group container has `role="group"` and `aria-label="Unidade de temperatura"`
- Integration tests:
  - [x] WeatherDashboardPage renders UnitToggle in header between search and actions
  - [x] Toggle visible on first paint without scrolling (desktop layout)
  - [x] Click °F → toggle shows °F as active segment
  - [x] Reload with `{ temp: 'f' }` in localStorage → °F segment active on mount
  - [x] Clear localStorage → page loads with °C active
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Toggle visible in sticky header per PRD F1 acceptance
- Toggle is keyboard-operable with programmatic selected state for assistive tech
- Preference survives page reload via localStorage
- No new loading states or network requests triggered by toggle interaction
