# PRD: Internationalization (PT-BR / EN)

## Overview

The weather dashboard currently presents all copy in Brazilian Portuguese. This feature adds bilingual support so learners and reviewers can use the product in **PT-BR** or **English**, switching instantly without losing context. Default remains PT-BR on first visit, preserving the product's established voice while making the sandbox accessible to English-speaking audiences.

**Problem**: Monolingual UI limits who can evaluate and learn from the app.
**Audience**: Developers using the app as a training sandbox (local dev, split-screen with editor).
**Value**: Demonstrates production-grade i18n craft alongside full-stack patterns; learners study locale switching, persistence, and localized formatting as first-class product concerns.

## Goals

- Users can read the entire dashboard in PT-BR or EN with one click.
- First-time visitors see PT-BR; returning visitors see their last explicit choice.
- Weather condition labels and date/time values reflect the active locale.
- Language preference is independent of temperature unit (°C/°F).
- Zero visible untranslated user-facing strings in either locale at MVP sign-off.

## User Stories

**Primary — Learner (PT-BR default)**
- As a learner, I want the app in Portuguese by default so that it matches the product brand and my primary language.
- As a learner, I want to switch to English to compare copy and study i18n patterns in the codebase.
- As a learner, I want my language choice remembered so that I don't re-select it every session.

**Primary — Reviewer (EN preference)**
- As an English-speaking reviewer, I want to toggle EN via a visible control so that I can evaluate UX without translating mentally.
- As a reviewer, I want error messages and empty states in my chosen language so that failure paths feel trustworthy.

**Secondary — Accessibility user**
- As a keyboard user, I want the language switcher operable without a mouse so that locale choice meets WCAG expectations.
- As a screen reader user, I want the page `lang` attribute and control labels to reflect the active locale.

## Core Features

### 1. Locale Support (PT-BR + EN)
- Two locales only: `pt-BR` and `en`.
- PT-BR is the fallback when no saved preference exists.
- Document root `lang` updates when locale changes.

### 2. Language Switcher (Top Bar)
- Compact flag control (🇧🇷 / 🇺🇸) placed in the top bar near unit toggles.
- Active locale is visually distinct (same affordance pattern as °C/°F).
- Each option exposes an accessible name (e.g., "Português (Brasil)", "English") — not flag emoji alone.
- Switching is instant with no full page reload.

### 3. Translated Interface Copy
All user-visible static strings, including:
- Brand/header ("Tempo", tagline)
- Search placeholder and aria labels
- Buttons (refresh, geolocation, retry, favorites)
- Empty states ("Busque uma cidade…", city-not-found)
- Loading skeleton aria labels
- Error toasts and recoverable action labels
- API status pill text
- Card section titles (hourly, daily, air quality, sun arc, metrics)
- Geolocation permission/denied messages

### 4. Localized Weather Condition Labels
- All WMO weather code labels (e.g., "Céu limpo" ↔ "Clear sky", "Chuva forte" ↔ "Heavy rain") translate with locale.
- Hero condition text, daily forecast summaries, and any condition-dependent copy use the active locale.

### 5. Localized Date and Time Formatting
- Times, dates, and day names in forecast cards follow locale conventions (e.g., 24h vs 12h where appropriate, localized weekday names).
- Formatting respects active locale via standard locale-aware APIs; no manual string concatenation for dates.

### 6. Localized Error Messages
- User-facing errors (network failure, city not found, upstream unavailable, geolocation denied) display in the active locale.
- Error meaning stays consistent across locales; tone remains direct and informative per brand guidelines.

### 7. Preference Persistence
- Explicit language choice persists in the browser across sessions and tab closes.
- Saved preference overrides the PT-BR default on return visits.
- Clearing browser storage resets to PT-BR default.

## User Experience

**First visit (no saved preference)**
1. App loads in PT-BR.
2. User sees 🇧🇷 active in top bar.
3. All copy, weather labels, and dates appear in Portuguese.

**Switching to English**
1. User clicks 🇺🇸 in top bar.
2. Interface updates immediately — no flash of untranslated content.
3. Weather labels and formatted dates switch to EN conventions.
4. Preference is saved; reload keeps EN.

**Returning visit**
1. App reads saved preference.
2. Loads directly in last chosen locale.

**Accessibility**
- Language switcher is keyboard-focusable and operable with Enter/Space.
- Active locale announced via aria-pressed or aria-current on the control.
- `lang` on `<html>` matches active locale.
- Text expansion: EN strings may be longer; glass panels use flexible layout (no fixed-width buttons for translated labels).
- Motion: locale switch does not trigger decorative animation; respects `prefers-reduced-motion`.

## High-Level Technical Constraints

- Must integrate with the existing React + Vite SPA without changing the backend API contract.
- Must coexist with existing user preferences (temperature units, favorites) stored locally.
- Translation resources limited to two locales; no translation management platform required for MVP.
- Must not introduce visible layout shift or untranslated flash on locale change.
- Must maintain WCAG 2.1 AA contrast and keyboard operability for the new control.

## Non-Goals (Out of Scope)

- Additional languages beyond PT-BR and EN.
- URL-based locale routing (`/en`, `/pt`) or SEO hreflang tags.
- Backend API message localization or `Accept-Language` header negotiation.
- RTL language support.
- Professional translation workflow / TMS integration (Locize, Crowdin).
- Lazy-loaded translation bundles or CDN-hosted locale files (two locales fit in bundle).
- Locale tied to physical geolocation or IP detection.
- Translating third-party city/region names from geocoding results.
- Syncing locale preference to a user account (no auth exists).

## Phased Rollout Plan

### MVP (Phase 1)
- PT-BR + EN locale infrastructure.
- Flag switcher in top bar with persistence.
- Full interface copy translated.
- Weather condition labels translated.
- Date/time localized via locale-aware formatting.
- Error messages localized.
- Accessibility pass on switcher and `lang` attribute.

**Exit criteria**: Manual QA checklist passes in both locales; no untranslated user-visible strings; preference persists across reload.

### Phase 2 (Future)
- Translation key lint/CI guard to prevent new hardcoded strings.
- Visual regression snapshots per locale.

### Phase 3 (Future)
- Additional locales if product scope expands beyond training sandbox.

## Success Metrics

- **Coverage**: 100% of inventoried user-visible strings have EN and PT-BR entries at MVP.
- **Persistence**: Language choice survives browser restart in manual QA (10/10 trials).
- **Switch latency**: Locale change perceived as instant (< 100ms perceived; no loading spinner).
- **Accessibility**: Language switcher passes keyboard and screen reader smoke test.
- **Layout**: No text truncation or overflow regressions in EN vs PT-BR on mobile and desktop viewports.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Incomplete string inventory leaves PT-BR fragments in EN mode | Create exhaustive copy inventory before translation; QA both locales side-by-side |
| Flag icons confuse users (flag ≠ language) | Pair flags with accessible text labels; document in design review |
| English copy diverges from brand voice | Short voice guide for EN: direct, informative, no hype — mirror PT-BR tone |
| Text expansion breaks glass layout | Test EN strings in narrow viewports; use flexible padding per DESIGN.md |
| Learners assume URL should change locale | Document in README that locale is preference-based, not URL-based |

## Architecture Decision Records

- [ADR-001: Full UI i18n with PT-BR Default and Flag Switcher](adrs/adr-001.md) — Deliver complete bilingual UI with flag switcher, browser persistence, and localized formatting; reject MVP-only and URL-routing approaches.

## Open Questions

- Should the EN brand header remain "Tempo" or become a localized product name (e.g., "Weather")?
- Should air-quality category labels (Good, Moderate, etc.) follow EPA naming in EN and CONAMA naming in PT-BR, or use a simplified bilingual set?
- Who owns ongoing translation maintenance when new UI copy is added post-MVP?
