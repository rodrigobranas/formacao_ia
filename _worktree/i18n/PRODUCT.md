# Product

## Register

product

## Users

Developers learning AI-assisted coding through hands-on exercises. They use this app as a training sandbox — not as a daily weather tool. Context: a local dev environment, often split-screen between editor and browser, evaluating how well the interface communicates state (loading, errors, API health) while they iterate on code. The redesign raises the bar: the surface should now look and feel like a shipped consumer weather product, so learners study craft (motion, glass depth, data viz, responsive layout) alongside full-stack wiring.

## Product Purpose

A weather dashboard ("Painel de clima") that demonstrates a clean full-stack pattern: React frontend, Express backend, external weather API (Open-Meteo). Success means a learner can search by city (with autocomplete) or geolocation, read current conditions plus a 24-hour graph, 7-day forecast, sun arc, and air quality at a glance, toggle °C/°F, pin favorites — and trust that the UI reflects real backend state. The interface is immersive but never noisy: the atmosphere expresses the weather, and the readings stay unmistakably legible.

## Brand Personality

Atmospheric, immersive, alive — **the sky is the instrument**. The surface reflects the actual conditions: a clear afternoon glows blue, an overcast night cools to slate, a storm darkens to violet. Underneath that mood the product is still precise and dependable: tabular figures, honest data, and visible state. Voice is direct and informative in PT-BR — no hype — but the presentation now has confidence and depth instead of staying deliberately neutral.

## Anti-references

Frosted glass over a live sky is the **identity** here, not decoration — so the anti-references target the *wrong* execution, not the technique:

- **Cartoon weather theatrics**: emoji or 3D-render weather icons, bouncing suns, kawaii clouds. Icons stay monoline and calm.
- **Candy / neon gradients**: oversaturated rainbow skies, glowing toy-like surfaces. Sky gradients are muted and physically plausible (dusk, overcast, clear-night), never a screensaver.
- **Washed-out glass**: low-contrast gray text floating on a translucent panel because "it looks elegant." Every panel has real depth behind it and text that clears contrast against the *composited* background.
- **Decorative blur with nothing behind it**: backdrop-filter used as a style tic. Glass is only used where a panel genuinely sits over the sky.
- **Skeuomorphic gauges and chrome**: glossy dials, beveled widgets, fake-metal bezels. Data viz stays flat, geometric, and legible.
- **AI slop**: side-stripe borders, gradient text, eyebrow kickers on every section, hero-metric templates, numbered section markers without a real sequence.

## Design Principles

1. **Atmospheric immediacy** — The hero sky recolors from the live weather code and day/night. The mood is a readout, not a backdrop.
2. **Glass with legible depth** — Panels are frosted glass layered over the sky; depth comes from real surface alphas + backdrop blur + soft shadow. Text contrast is verified against the composited background, never assumed from the token alone.
3. **Data still first** — Temperature, conditions, and metrics dominate the hierarchy; chrome (glass, borders, motion) recedes behind the readings.
4. **State is visible** — Loading (skeleton sweep), error (toast + retry), empty (no air-quality data), and API-offline are first-class, with clear PT-BR copy. Learners see how a real tool handles failure.
5. **Motion conveys state** — The sky transition, skeleton sweep, and reveals are purposeful feedback, never choreography for its own sake; each has a full `prefers-reduced-motion` alternative.
6. **PT-BR copy, universal structure** — Copy stays in PT-BR; layout and interaction patterns (search, autocomplete, toggles, favorites) follow familiar consumer-weather conventions.

## Accessibility & Inclusion

Target **WCAG 2.1 AA on a dark surface**: body text contrast ≥4.5:1, large text (≥18px or bold ≥14px) ≥3:1, placeholder text meeting the 4.5:1 body requirement. **Glass-contrast rule:** muted text (`#8a95a8`) and any text rendered over a translucent surface must be verified against the *composited* background (surface alpha over the dynamic sky), not against the token in isolation — bump toward `--fg-2` (`#c4cdda`) or `--fg` when contrast is close. Keyboard-operable search, autocomplete (↑/↓/Enter/Esc, ARIA listbox), units toggle, favorites, and geolocation. All motion respects `prefers-reduced-motion` with instant or crossfade alternatives. Color is never the sole indicator of state — air-quality, UV, API status, and errors always pair color with a text label or icon.
