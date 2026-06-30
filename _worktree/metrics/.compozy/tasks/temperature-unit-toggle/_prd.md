# PRD: Global Temperature & Units Toggle

## Overview

The weather dashboard ("Tempo · Open-Meteo") currently shows every measurement in Celsius and metric units. Learners and users expect the same control found in consumer weather products: a header toggle that switches the entire dashboard between Celsius/metric and Fahrenheit/imperial readings instantly.

This feature adds a **global °C/°F segmented toggle** in the sticky top bar. One choice updates all in-scope values on screen—temperature, wind, precipitation, and pressure—without reloading or showing a loading state. The default remains Celsius; the user's choice persists when they return.

**Audience:** Developers learning AI-assisted full-stack coding via a training sandbox, and anyone using the demo dashboard who prefers Fahrenheit or imperial units.

**Value:** Closes a gap between product vision (`PRODUCT.md`, `DESIGN.md`) and the shipped app; demonstrates preference state, persistence, and consistent formatting—a realistic consumer-weather pattern.

## Goals

1. **Parity with design vision** — Header toggle matches the documented Top Bar spec (segmented glass control, °C / °F labels).
2. **Instant, global consistency** — Toggling updates every in-scope reading at once with no visible fetch or skeleton state.
3. **Remembered preference** — Choice survives page reload and new sessions; first-time visitors see Celsius.
4. **Accessible control** — Toggle is keyboard-operable, exposes a clear selected state, and meets WCAG 2.1 AA on the dark glass surface.
5. **Training completeness** — Learners see end-to-end preference flow (UI control → formatted readings → persistence) without scope creep.

## User Stories

### Primary persona: Developer learner

- As a developer learner, I want a °C/°F toggle in the header so that I can study how consumer weather apps handle unit preferences.
- As a developer learner, I want all dashboard numbers to switch together so that I understand global preference state vs. scattered formatting.
- As a developer learner, I want my unit choice to persist after refresh so that I can observe realistic user-preference behavior.

### Secondary persona: Demo user

- As a user who thinks in Fahrenheit, I want to switch units once and see wind and rain in familiar imperial units so that I do not mentally convert every card.
- As a returning visitor, I want the app to remember my last unit choice so that I do not reset the toggle every session.

### Edge cases

- As a user viewing weather for any city (search or geolocation), I expect the same unit preference to apply regardless of how I loaded the location.
- As a user with reduced motion enabled, I still expect the toggle and updated numbers to remain usable without relying on animation alone.

## Core Features

### F1 — Header unit toggle (Priority: P0)

- Segmented control in the sticky top bar, between search and geolocation actions, per `DESIGN.md`.
- Two segments: **°C** and **°F**; exactly one active at a time.
- Active segment uses elevated glass styling; inactive segment is muted.
- Control works on desktop and wrapped mobile top bar layout.

**Acceptance:** User can select either segment; selection is visually and programmatically distinct (selected state available to assistive tech).

### F2 — Global instant conversion (Priority: P0)

When the active unit changes, **all in-scope readings update immediately** on the current dashboard without loading indicators or error toasts triggered by the toggle itself.

**In-scope surfaces (inventory):**

| Area | Readings affected |
|------|-------------------|
| Hero | Main temperature, máx/mín, sensação térmica |
| Hero quick stats | Sensação (temperature), Vento (speed + unit label) |
| Hourly forecast | Per-hour temperature labels; temperature curve scale |
| 7-day forecast | Low/high labels; range bar positioning reflects converted values |
| Detailed metrics | Sensação, real temperature, Vento, Rajadas, Precipitação, Pressão |

**Out of scope for conversion:** Percentages (humidity, cloud cover, rain probability), UV index, AQI, cardinal wind direction, times, weather condition labels, API status.

**Unit pairs when °F / imperial is active:**

- Temperature → Fahrenheit (whole degrees, consistent rounding)
- Wind speed & gusts → mph
- Precipitation → inches
- Pressure → inHg

**Acceptance:** No in-scope label remains in the previous unit system after toggle; values do not require user to refresh or re-search.

### F3 — Persisted preference (Priority: P0)

- User's last selected unit (°C or °F) is stored and restored on subsequent visits.
- First visit (no stored preference): **Celsius / metric**.
- New searches and geolocation loads respect the stored preference immediately.

**Acceptance:** Reload browser → toggle and all readings reflect last choice; clear storage → returns to Celsius default.

### F4 — Consistent formatting & labels (Priority: P1)

- Converted values use the same rounding rules everywhere (no card showing `70°` while another shows `69°` for the same underlying reading).
- Unit symbols appear where the design already shows them (e.g., wind suffix, pressure suffix); placeholders (`—`) unchanged for missing data.

## User Experience

### Primary flow

1. User opens dashboard → sees Celsius/metric readings; toggle shows **°C** active (unless returning user with saved °F).
2. User taps **°F** → all in-scope numbers and unit labels update instantly; hero temperature remains the visual anchor.
3. User searches a new city or uses geolocation → new data appears already formatted in the selected unit system.
4. User closes tab and returns later → **°F** still selected; readings load in Fahrenheit/imperial.

### UI/UX considerations

- Toggle must not compete with the hero temperature hierarchy (`DESIGN.md` "One-Display Rule" applies to typography, not to hiding the control).
- PT-BR copy elsewhere unchanged; segment labels stay universal **°C** / **°F**.
- `prefers-reduced-motion`: toggle state change does not depend on motion; optional subtle transition may be suppressed.
- Screen readers: announce selected segment; updated temperature regions already using `aria-live="polite"` should reflect new values.

### Discoverability

- Placement in the persistent header ensures the control is visible during search, scroll, and error states—standard for weather apps.

## High-Level Technical Constraints

- Must integrate with the existing weather dashboard and Open-Meteo–backed data flow without changing which cities or forecasts are available.
- Must preserve current error, loading, and empty states; unit toggle must not introduce new failure modes visible to the user.
- Must remain compatible with the dark glass design system and WCAG 2.1 AA contrast requirements on composited backgrounds.
- Preference storage is client-side only for this feature—no account or server-side profile required.

## Non-Goals (Out of Scope)

- Dual-unit display (e.g., `21°C (70°F)` simultaneously).
- Separate toggles per measurement type (temperature vs. wind vs. pressure).
- Dedicated settings page or modal for units.
- Locale/system auto-detection on first visit (deferred; Celsius remains default).
- Changing non-metric readings: percentages, UV, AQI, weather codes, sun times.
- Favorites feature or other deferred items from the original climate panel PRD.
- Server-side user profiles or cross-device sync of preferences.

## Phased Rollout Plan

### MVP (Phase 1) — Full global toggle

- Header segmented control per design spec.
- Instant conversion of all in-scope inventory (F2 table).
- Client persistence with Celsius default (F3).
- Accessibility pass on toggle + updated live regions.

**Exit criteria:** Manual QA confirms every in-scope surface; preference survives reload; default is Celsius for new users.

### Phase 2 — Polish & locale (future)

- Optional locale-aware default on first visit (Celsius for most locales, Fahrenheit where convention dictates).
- Optional dual-unit readout mode for accessibility or power users.

**Exit criteria:** Product decision to prioritize; not required for MVP sign-off.

### Phase 3 — Extended imperial (future)

- Additional imperial pairs if new metrics are added (visibility, distance, etc.).

## Success Metrics

| Metric | Target |
|--------|--------|
| Toggle discoverability | Control visible in header on first paint without scroll (desktop & mobile) |
| Conversion completeness | 100% of in-scope readings switch unit on toggle in QA checklist |
| Persistence | Preference restored in ≥99% of reload tests (excluding cleared storage) |
| Interaction latency (perceived) | User sees updated values in the same interaction frame—no loading skeleton triggered by toggle |
| Accessibility | Toggle operable via keyboard; selected state meets contrast spec |
| Learner objective | Demo supports teaching "global preference + formatted output" as a single coherent feature |

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Missed surface still shows °C after toggle | Maintain explicit in-scope inventory; QA walks every card |
| Inconsistent rounding across cards | Define single rounding rule in TechSpec; user-facing acceptance in F4 |
| Toggle clutter on small screens | Follow responsive top bar wrap rules from `DESIGN.md` |
| Users expect dual units | Document non-goal; consider Phase 2 |
| Preference lost in private browsing | Accept ephemeral storage limitation; default to Celsius gracefully |

## Architecture Decision Records

- [ADR-001: Global Header Toggle with Instant Unit Conversion](adrs/adr-001.md) — Single header toggle, instant conversion of temperature + wind + precipitation + pressure, Celsius default, persisted preference; rejects phased temp-only, locale default, and dual-display approaches.

## Open Questions

1. **Pressure imperial label precision** — Should inHg show one decimal place or round to whole numbers for consistency with temperature? (Recommend deciding in TechSpec with a single rule.)
2. **Precipitation very small values** — Display threshold for inch values near zero (e.g., show `0 in` vs. `<0.01 in`) — confirm during implementation QA.
