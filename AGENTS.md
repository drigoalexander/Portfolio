# Drigo Portfolio — Agent Guide

## Vibe

Cinematic golden-hour portfolio: warm sun-gold accents on near-black, dark
silhouettes, film-grain, editorial/vintage mood. High contrast, dramatic,
GSAP-driven "wow". Dark-only.

## Stack

- **Astro 7** — static structure, routing, SEO (zero-JS by default).
- **Vue 3 islands** — interactivity/state/GSAP, hydrated lazily (`client:visible`).
- **Tailwind CSS v4** (`@tailwindcss/vite`) — CSS-first `@theme` tokens.
- **GSAP 3.15** — all plugins available (ScrollTrigger, Observer, Flip,
  SplitText, DrawSVG, MorphSVG, Draggable, Inertia, ScrollTo).

## Development

Start the dev server in background mode:

```
astro dev --background
```

Manage with `astro dev stop`, `astro dev status`, `astro dev logs`.
Package manager is **Bun** (`bun run <script>`, `bunx <bin>`).
Run unit tests with `bun run test`. Typecheck with `bunx astro check`.

## Frontend best practices

- Semantic HTML; one `<h1>` per page; landmarks (`header`/`main`/`footer`).
- Accessibility: visible focus states, keyboard operability, ARIA only when
  semantics fall short, sufficient contrast against `--color-bg`.
- **`prefers-reduced-motion: reduce` is mandatory** — animations must resolve
  to their final visible state instantly; content is never hidden behind motion.
- TypeScript strict; no `any` without justification.
- Progressive enhancement: content renders without JS; islands enhance.
- Performance/CWV: hydrate islands lazily, avoid layout shift, prefer transforms
  over layout-affecting properties.

## Component pattern (dumb vs clever)

```
src/components/ui/         dumb / presentational — props in, events out, no side-effects
src/components/sections/   Astro section composers — static shell, SEO, structure
src/components/islands/    clever / interactive — Vue, client:visible, owns state + GSAP
src/lib/gsap/              animation abstractions
```

- **Astro** for anything non-interactive (default).
- **Vue islands** for interactivity; keep them focused — a growing file is a
  signal it's doing too much. Clever components compose dumb ones.
- `ui/` and `sections/` directories are created when the first component lands.

## Color tokens — the law

Defined in `src/styles/global.css` via `@theme`. Two raw ramps (`dusk-*` cool
neutrals, `gold-*` the sun) plus semantic aliases:
`bg`, `surface`, `surface-raised`, `border`, `muted`, `ink`, `ink-soft`,
`accent`, `accent-strong`, `accent-deep`.

- Components use **semantic** utilities only: `bg-bg`, `text-ink`, `text-accent`,
  `border-border`, etc.
- Raw ramps (`bg-dusk-800`, `text-gold-300`) only for intentional tints/shades.
- **Never hardcode hex in components.**
- Atmosphere utilities: `bg-sun` (radial backlight), `film-grain` (grain overlay).

## GSAP — the law

- Plugins are registered **exactly once** in `src/lib/gsap/register.ts`. Never
  call `gsap.registerPlugin` anywhere else.
- Components **never `import gsap` directly** for effects. Use a composable from
  `src/lib/gsap/composables/` or the declarative `[data-anim]` layer.
- Every animation is wrapped in `gsap.context()` and cleaned up. Vue islands call
  the composable's `kill()` in `onUnmounted`.
- All composables share the contract `{ ctx, kill }` and are SSR-safe.
- `initGsap()` (from `src/lib/gsap`) runs once globally via `Layout.astro`; it
  registers GSAP and wires `[data-anim]` content.

### Declarative animations (static content)

Add attributes to any element rendered by Astro — no JS needed:

```html
<p data-anim="reveal" data-anim-delay="0.1">…</p>   <!-- fade/rise on scroll -->
<h2 data-anim="split">…</h2>                          <!-- SplitText word sweep -->
<img data-anim="parallax" data-anim-y="80" />         <!-- scrub parallax -->
<svg data-anim="draw">…</svg>                          <!-- DrawSVG stroke -->
```

Modifiers: `data-anim-delay`, `data-anim-duration`, `data-anim-y`, `data-anim-from`.

### Composables (interactive islands)

`useScrollReveal`, `useSplitReveal`, `useParallax`, `useMagnetic`,
`useHorizontalScroll` (Observer/pin), `useDraggable` (+ Inertia), `useDrawSVG`,
`captureFlip` + `useFlip`. Signature eases live in `src/lib/gsap/eases.ts`
(`EASES.hop | sweep | glide`).

## Living reference

`/styleguide` renders all tokens and animation demos — use it to verify tokens
and motion (including reduced-motion behavior).

## Docs

Astro: https://docs.astro.build · GSAP: https://gsap.com/docs/v3/
