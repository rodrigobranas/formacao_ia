---
name: Painel de Clima
description: An atmospheric dark-glass weather dashboard whose sky reflects live conditions
colors:
  background: "#0a0e16"
  background-2: "#0d1320"
  surface: "rgba(255,255,255,0.05)"
  surface-2: "rgba(255,255,255,0.08)"
  surface-3: "rgba(255,255,255,0.11)"
  foreground: "#eef2f9"
  foreground-2: "#c4cdda"
  muted: "#8a95a8"
  muted-2: "#646f82"
  accent: "#5ec8ff"
  accent-deep: "#2a90d8"
  border: "rgba(255,255,255,0.085)"
  border-2: "rgba(255,255,255,0.15)"
  destructive: "#ef5e6f"
  good: "#48d39a"
  fair: "#a6e05a"
  moderate: "#f5cf4a"
  poor: "#f59257"
  bad: "#ef5e6f"
  very-bad: "#b274e6"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "clamp(72px, 11vw, 116px)"
    fontWeight: 200
    lineHeight: 0.9
    letterSpacing: "-0.05em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "clamp(16px, 2.1vw, 21px)"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.005em"
  mono:
    fontFamily: "'SF Mono', ui-monospace, 'JetBrains Mono', 'Roboto Mono', Menlo, monospace"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.02em"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.07em"
rounded:
  xs: "11px"
  sm: "13px"
  md: "15px"
  lg: "22px"
  full: "9999px"
spacing:
  card-padding: "20px"
  card-padding-lg: "22px"
  hero-padding: "clamp(22px, 3.4vw, 34px)"
  section-gap: "16px"
effects:
  glass-blur: "blur(18px) saturate(1.2)"
  glass-blur-strong: "blur(24px) saturate(1.4)"
  shadow: "0 24px 60px -28px rgba(0,0,0,0.75)"
  sky-glow: "rgba(94,200,255,0.22)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#06121d"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "46px"
  icon-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground-2}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    height: "46px"
    backdropFilter: "{effects.glass-blur}"
  card-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
    backdropFilter: "{effects.glass-blur}"
  hero:
    backgroundColor: "dynamic sky gradient (see Colors → Dynamic Sky)"
    textColor: "{colors.foreground}"
    border: "1px solid {colors.border-2}"
    rounded: "{rounded.lg}"
    padding: "{spacing.hero-padding}"
    shadow: "{effects.shadow}"
---

# Design System: Painel de Clima

## Overview

**Creative North Star: "Atmospheric Glass — the sky is the interface."**

This system renders the weather dashboard as frosted-glass panels floating over a **live sky**. The hero recolors from the actual weather code and day/night state — clear blue afternoon, slate overcast, violet storm, deep-navy clear night — and a matching glow bleeds into the page background. The aesthetic is a deep neutral shell (`#0a0e16`) with translucent surfaces, a single sky-blue accent (`#5ec8ff`), and a calm semantic ramp reserved for data (AQI, UV). Glass and motion are **purposeful here, not decorative**: for a product whose subject *is* the atmosphere, depth-over-sky is the identity. Legibility still wins every tie — text contrast is verified against the composited background, never the token alone.

This is a deliberate reversal of the previous "Instrument Panel" system (light, flat, zinc, anti-glass). What that system banned — glass, sky gradients — is now the core, governed by explicit guardrails so it never becomes slop.

**Key Characteristics:**

- Deep neutral shell `#0a0e16` → `#0d1320` with a dynamic sky glow; **dark-only** (no light variant).
- Layered translucent glass surfaces (`rgba(255,255,255,.05 → .11)`) with `backdrop-filter: blur(18px) saturate(1.2)`.
- Single sky-blue accent (`#5ec8ff`); a 6-step semantic ramp (`good → very-bad`) used only for AQI/UV data.
- System sans for everything; mono for numeric readouts (times, coordinates, pollutant values); `tabular-nums` globally.
- Oversized thin temperature display (weight 200); tracked uppercase micro-labels on card headers.
- Generous radii (22 / 15 / 13 / 11px) and one soft ambient shadow — depth, not card-on-card stacks.

## Colors

A dark atmospheric palette. The shell and glass are neutral; the only chromatic identity is the sky-blue accent and the data-only semantic ramp. Verify every text/surface pair against the composited result.

### Shell

- **Abyss** (`#0a0e16`) / **Abyss-2** (`#0d1320`): Page background, composed as `radial-gradient(sky-glow) , linear-gradient(180deg, #0d1320, #0a0e16)`, `background-attachment: fixed`.

### Glass Surfaces

- **Surface** (`rgba(255,255,255,.05)`): Default card/panel fill over the shell.
- **Surface-2** (`rgba(255,255,255,.08)`): Hover / focused inputs / active toggle track.
- **Surface-3** (`rgba(255,255,255,.11)`): Inset tracks, selected toggle, progress rails.
- **Border** (`rgba(255,255,255,.085)`) / **Border-2** (`rgba(255,255,255,.15)`): Hairline strokes; Border-2 for the hero and emphasized edges.

### Ink

- **Foreground** (`#eef2f9`): Primary text and readouts. ~15:1 on the shell.
- **Foreground-2** (`#c4cdda`): Secondary text; the fallback when muted is too low over glass.
- **Muted** (`#8a95a8`): Labels, metadata, placeholders. Verify ≥4.5:1 over the *composited* surface; bump to Foreground-2 when close.
- **Muted-2** (`#646f82`): Faint hints, disabled, zero-values. Decorative/large only — not body text.

### Accent & Semantic (data only)

- **Accent** (`#5ec8ff`) / **Accent-deep** (`#2a90d8`): Primary action, current/now indicators, graph line, focus. Never tints whole surfaces.
- **Semantic ramp** — reserved for air quality and UV severity, paired with a text label:
  `good #48d39a` · `fair #a6e05a` · `moderate #f5cf4a` · `poor #f59257` · `bad #ef5e6f` · `very-bad #b274e6`.

### Dynamic Sky

The hero background and page glow are computed from the WMO weather group + `is_day`. Each group maps to three gradient stops + a glow color, with separate day and night tables (e.g. clear-day `#3b82d9 / #1f5fae / #0d2f5c`, clear-night `#1c3056 / #11203f / #080e1c`, storm pulls violet). Applied as CSS variables on the hero and transitioned over `.9s`. Implementation: `frontend/src/lib/sky.ts`.

### Named Rules

- **The Live-Sky Rule.** The hero gradient is data, not decoration — it always reflects the current weather code and day/night. Never hard-code a "nice" gradient.
- **The Single-Accent Rule.** Sky-blue is the only accent. The semantic ramp is for data severity only, never for chrome or emphasis.
- **The Composited-Contrast Rule.** Judge text contrast against surface-alpha-over-sky, not the token. When in doubt, go to Foreground-2.

## Typography

**Family:** System sans (`-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, system-ui`) for all UI; a mono stack for numeric readouts. Single-family discipline plus mono for figures — no decorative pairing. `font-variant-numeric: tabular-nums` and `letter-spacing: -0.005em` globally.

**Character:** Precise and quiet, with one expressive moment — the oversized thin temperature. Hierarchy comes from size and weight, not font contrast.

### Hierarchy

- **Display / Temperature** (200, `clamp(72px,11vw,116px)`, lh .9, ls -.05em): The hero temperature. Exactly one per view; the system's only display moment.
- **Location** (600, `clamp(20px,3vw,26px)`, ls -.02em): City name in the hero.
- **Title** (550, `clamp(16px,2.1vw,21px)`): Condition label, metric values.
- **Body** (400, 15px, lh 1.5): General content; cap prose at 65–75ch.
- **Mono** (600, 12px, ls .02em): Times, coordinates, country codes, pollutant figures.
- **Card label** (600, 11px, ls .07em, uppercase): Card headers ("Próximas 24 horas", "Qualidade do ar") and metric labels.

### Named Rules

- **The One-Display Rule.** Only the temperature uses the thin oversized scale. Nothing else competes with it.
- **The Mono-for-Figures Rule.** Numeric readouts that benefit from alignment (clock times, lat/long, µg/m³) use the mono stack; prose and labels stay sans.

## Elevation — Glass Depth

Depth is built from **translucent surfaces + backdrop blur + one ambient shadow**, layered over the dynamic sky. This replaces the old "flat-by-default" model. Glass is the structural material, but it is bounded: there is a fixed set of surface layers, and they never nest into each other.

### Depth Vocabulary

- **Panel** (`surface` + `1px border` + `backdrop-filter: blur(18px) saturate(1.2)`): The default card.
- **Hero** (dynamic sky + `border-2` + `shadow: 0 24px 60px -28px rgba(0,0,0,.75)`): The one elevated, atmospheric surface.
- **Popover / Suggestions** (`rgba(16,21,33,.86)` + `blur(24px) saturate(1.4)` + shadow): Floating menus, rendered above content (escaping clipping containers).
- **Inset** (`surface-3`, no blur): Tracks, rails, selected states *inside* a panel.

### Named Rules

- **The No-Nesting Rule.** Glass does not stack on glass. A panel may contain inset tracks (`surface-3`) but never another blurred glass card. One glass layer per region.
- **The Real-Depth Rule.** `backdrop-filter` is only applied where the element genuinely overlaps the sky or content behind it. No blur as a flat style tic.
- **The One-Shadow Rule.** The ambient hero shadow is the only shadow. Panels separate via border + blur, not drop shadows.

## Motion

Motion is feedback, scaled to a product UI (150–250ms for interactions); the sky is the one slow, expressive transition.

- **Sky transition** (`.9s ease`): When conditions/location change, the hero gradient and page glow cross-fade.
- **Skeleton sweep** (`1.3s` translateX shimmer over `surface-3`): Loading placeholders for hero/hourly/daily.
- **Busy pulse** (`1s`): Geolocation / refresh in flight.
- **Suggestion + toast** (`.2–.3s`): Dropdown open, toast slide-in from bottom.
- **Reveal**: Optional staggered entrance for list items (hourly/daily), fit to what it reveals — never a uniform reflex, never gating content visibility on a class toggle.

### Named Rule

- **The Reduced-Motion Rule.** `@media (prefers-reduced-motion: reduce)` disables the sky transition, skeleton sweep, pulse, and reveals — replaced by instant state changes or a crossfade. This is required, not optional.

## Components

### Top Bar

Sticky row: brand (sky-blue logo tile + "Tempo · Open-Meteo"), flexible glass search, °C/°F segmented toggle, geolocation icon-button. Wraps on mobile (search becomes full-width, brand subtitle hides ≤540px).

### Search + Autocomplete

- **Field:** glass box (`surface` + `border`, `blur(14px)`), 46px, search/spinner leading icon, `surface-2` on focus-within.
- **Suggestions:** floating popover (`blur(24px)`), rendered to **escape the clip** (native popover / `position: fixed` / portal — never `position: absolute` inside an `overflow:hidden` panel). ARIA `listbox`/`option`; keyboard `↑/↓/Enter/Esc`; active row tinted `surface-2`; country-code chip in mono.

### Units Toggle

Segmented control (`surface` track, 46px), active segment lifts to `surface-3` with a soft shadow; inactive text is muted. °C / °F.

### Favorites

Glass chips (`surface`, radius 11px): city name + mono country code + remove "×". Active (current location) chip uses `border-2` + `surface-2`. Empty state: a muted hint, "★ Favorite uma cidade para acesso rápido".

### Hero (dynamic sky)

The signature surface. Dynamic sky gradient + ambient shadow. Contains: location name + favorite star, "Atualizar" + local time, the oversized thin temperature with condition + máx/mín, a large monoline weather icon with a soft radial halo, and a 4-up quick-stats strip (Sensação / Vento / Umidade / Prob. de chuva) on an inset glass grid. `aria-live="polite"`.

### Hourly Forecast Card

Horizontal scroll (24 columns). An SVG temperature **curve** with a gradient area fill spans the row; per-column: temperature label riding the curve, monoline icon, time (mono, "Agora" highlighted in accent), precip-probability with a droplet glyph. Thin custom scrollbar.

### Daily Forecast Card

Seven rows: weekday (mono-ish, "Hoje" emphasized), monoline icon, precip-prob (accent, muted when zero), and a low→high **range bar** positioned within the week's min/max, filled with a temperature gradient.

### Detailed Metrics

Responsive grid of glass cells (radius 15px): Sensação, Vento (with a **compass** SVG + cardinal point), Umidade (bar), Pressão, Índice UV (semantic-colored bar + label), Nuvens (bar), Precipitação, Rajadas. Label = uppercase micro-label + inline icon; value = 550 weight with a muted unit.

### Sun Arc Card

A quadratic SVG arc from sunrise to sunset with a dashed full path, a solid progress overlay (`moderate` color), and a glowing sun dot at the current time-of-day position. Sunrise/sunset times below in mono.

### Air Quality Card

Circular EAQI gauge (semantic-colored ring + big value), category label + one-line description (PT-BR), and a 2-up pollutant grid (PM2.5, PM10, O₃, NO₂ in mono µg/m³). **Empty state** when the air payload is null: a muted "Dados de qualidade do ar indisponíveis para este local."

### States

- **Skeleton:** sweep shimmer on hero temperature, hourly, daily during load.
- **API status pill:** glass `rounded-full`, pulsing dot (green/red/amber) + label; pulse respects reduced-motion.
- **Error toast:** glass toast pinned bottom-center, warning icon + message + "Tentar de novo"; auto-dismiss.
- **Placeholder/empty:** muted, centered, instructive PT-BR copy.

## Do's and Don'ts

### Do:

- **Do** drive the hero sky and page glow from the live weather code + day/night via `lib/sky.ts` — the mood is a readout.
- **Do** keep one glass layer per region; use `surface-3` insets for tracks/rails inside a panel.
- **Do** verify muted text against the *composited* surface-over-sky; bump to `--fg-2` (`#c4cdda`) when contrast is close.
- **Do** use mono + `tabular-nums` for figures (times, coordinates, pollutant values) so numbers align.
- **Do** render the search dropdown so it escapes clipping (popover/fixed/portal), and give it full ARIA + keyboard support.
- **Do** provide a `prefers-reduced-motion` alternative for the sky transition, skeleton sweep, pulse, and reveals.
- **Do** pair every semantic color (AQI, UV, API status) with a text label or icon.

### Don't:

- **Don't** hard-code a "pretty" hero gradient or reuse one across conditions — it must reflect real data.
- **Don't** nest glass inside glass, or stack drop shadows for elevation — depth is border + blur + the single ambient shadow.
- **Don't** float low-contrast gray body text on glass; that is the washed-out-glass failure.
- **Don't** use cartoon/emoji/3D weather icons or candy-neon skies — icons are monoline, skies are physically plausible.
- **Don't** let the accent or semantic ramp tint whole surfaces; they mark actions and data severity only.
- **Don't** add side-stripe borders, gradient text, eyebrow kickers on every section, or hero-metric templates.
