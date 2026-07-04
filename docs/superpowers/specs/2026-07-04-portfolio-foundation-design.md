# Portfolio Foundation — Design Spec

**Date:** 2026-07-04
**Status:** Approved (design), pending implementation plan
**Scope:** Foundation only — design tokens, GSAP architecture, component conventions, and `CLAUDE.md`. No page sections or content yet.

## 1. Goal & Vibe

Establish the technical and visual foundation for a personal portfolio landing page with a strong "wow" factor driven by GSAP.

**Vibe** (from the reference palette image — golden-hour silhouette over a graveyard, Peaky Blinders mood): cinematic golden-hour backlight, dark silhouettes, warm sun-gold accents against near-black, film-grain, lens-flare energy. Editorial, vintage, serious, high-contrast.

**Stack (already installed):** Astro 7 + Vue 3 (`@astrojs/vue`) + Tailwind CSS v4 (`@tailwindcss/vite`) + GSAP 3.15 (all plugins free/available) + `@astrojs/sitemap`.

## 2. Decisions (locked)

| Area | Decision |
|---|---|
| Color tokens | Semantic aliases layered on two raw tonal ramps |
| Theme | Dark-only, cinematic (no light mode) |
| GSAP architecture | Central plugin registry + reusable composables + declarative `data-anim` directives |
| Component split | Astro = static/presentational (zero-JS); Vue islands = interactive/"clever" (GSAP, state) |

## 3. Color Tokens

Defined in `src/styles/global.css` using Tailwind v4 CSS-first `@theme`. Exact hex sampled from the reference image.

### Raw ramps

**`dusk`** — cool neutrals (backgrounds, silhouettes, gravestone-slate):

| Token | Hex |
|---|---|
| `dusk-950` | `#080705` |
| `dusk-900` | `#14110B` |
| `dusk-800` | `#211D11` |
| `dusk-700` | `#24241A` |
| `dusk-600` | `#383E3A` |
| `dusk-500` | `#484E42` |
| `dusk-400` | `#6B6E60` |
| `dusk-300` | `#8E9083` |
| `dusk-200` | `#B4B5AB` |
| `dusk-100` | `#D2D2C9` |
| `dusk-50`  | `#E9E7DE` |

**`gold`** — the sun; warm accent light → espresso:

| Token | Hex |
|---|---|
| `gold-50`  | `#FFF6E6` |
| `gold-100` | `#FFDEA9` |
| `gold-200` | `#FFD08E` |
| `gold-300` | `#FAC984` |
| `gold-400` | `#E1B479` |
| `gold-500` | `#C19968` |
| `gold-600` | `#A97F4E` |
| `gold-700` | `#996E43` |
| `gold-800` | `#6E4A26` |
| `gold-900` | `#513213` |

### Semantic aliases (dark-only)

| Semantic token | Value |
|---|---|
| `--color-bg` | `dusk-950` |
| `--color-surface` | `dusk-800` |
| `--color-surface-raised` | `dusk-700` |
| `--color-border` | `dusk-600` |
| `--color-muted` | `#7C6D50` (taupe) |
| `--color-ink` | `gold-100` (cream headings) |
| `--color-ink-soft` | `dusk-100` (body text) |
| `--color-accent` | `gold-300` (the sun) |
| `--color-accent-strong` | `gold-200` |
| `--color-accent-deep` | `gold-900` (espresso) |

Plus atmosphere tokens: `--gradient-sun` (radial backlit glow for hero), and a film-grain overlay treatment.

**Usage law:** components use semantic tokens only (`bg-bg`, `text-ink`, `text-accent`, `border-border`). Raw ramps (`dusk-*`, `gold-*`) are reserved for the rare intentional tint/shade. Never hardcode hex in components.

## 4. GSAP Architecture (`src/lib/gsap/`)

Designed against DRY + SOLID.

```
src/lib/gsap/
  register.ts        # single plugin registration + global config + reduced-motion guard
  eases.ts           # named signature CustomEases (one source of truth)
  autoAnimate.ts     # declarative [data-anim] enhancer for static Astro content
  index.ts           # initGsap() entry + barrel exports
  composables/
    useScrollReveal.ts
    useSplitReveal.ts     # SplitText
    useMagnetic.ts
    useParallax.ts
    useFlip.ts            # Flip
    useDrawSVG.ts         # DrawSVG
    useHorizontalScroll.ts# Observer + ScrollTrigger
    useDraggable.ts       # Draggable + Inertia
```

- **`register.ts`** — the *only* place plugins are registered: `ScrollTrigger`, `Observer`, `Flip`, `SplitText`, `DrawSVGPlugin`, `MorphSVGPlugin`, `Draggable`, `InertiaPlugin`, `ScrollToPlugin`. Sets `gsap.defaults`, registers signature eases, `ScrollTrigger.config`, and a global `prefers-reduced-motion` guard. **SRP:** registration only.
- **`composables/`** — one effect per file. Shared return contract `{ target, ctx, kill }`. All animations wrapped in `gsap.context()` (scoped selectors + one-call cleanup) and `gsap.matchMedia()` (responsive + reduced-motion). **OCP:** new effect = new file, core untouched. **DIP:** components depend on these composables, never import `gsap` directly. **ISP:** uniform minimal contract.
- **`autoAnimate.ts`** — declarative DRY layer. Client enhancer scans `[data-anim="reveal|split|parallax|draw"]` (+ modifier data-attrs like `data-anim-delay`) and wires the corresponding effect automatically, so **static Astro content animates with zero per-component JS**.
- **`index.ts`** — `initGsap()` single entry point; barrel export of composables.

**Reduced motion:** honored globally in `register.ts` and per-effect via `matchMedia`. When `prefers-reduced-motion: reduce`, animations resolve to final state instantly (no motion), content always readable.

**Cleanup:** every composable returns/handles teardown; Vue islands call `kill()` on unmount. No leaked ScrollTriggers/Observers.

## 5. Component Pattern

```
src/components/
  ui/          # dumb / presentational — Astro + Vue, props in / emits out, no side-effects
  sections/    # Astro section composers — static shell, SEO, structure
  islands/     # clever / interactive — Vue, client:visible, owns state + GSAP
src/layouts/   # page layouts
src/lib/gsap/  # animation abstractions
src/pages/     # routes
```

- **Astro** = zero-JS static structure, SEO, layout. Default for anything non-interactive.
- **Vue islands** = interactivity, state, GSAP; hydrated lazily (`client:visible` / `client:idle`).
- **Dumb** components take props + emit events, hold no business logic, are trivially reusable and testable.
- **Clever** components own state/effects and compose dumb components. Keep files focused; a growing file signals it's doing too much.

## 6. `CLAUDE.md` (rewrite of `AGENTS.md`)

`CLAUDE.md` is a symlink to `AGENTS.md`; edit `AGENTS.md`. Preserve the existing dev-server section (background mode). Add:

- **Project vibe brief** — the cinematic golden-hour direction.
- **Tech stack** — Astro + Vue islands + Tailwind v4 + GSAP.
- **Frontend best practices** — semantic HTML, accessibility (focus states, ARIA where needed, keyboard), `prefers-reduced-motion` mandatory, TypeScript strict, progressive enhancement, performance / Core Web Vitals (lazy hydration, avoid layout shift).
- **Dumb/clever component pattern** — the rules from §5.
- **Token usage law** — semantic tokens only, never raw hex (from §3).
- **GSAP conventions** — register once via `register.ts`; use composables/directives only, never import gsap ad-hoc in components; always `gsap.context()` + cleanup; reduced-motion always respected; notes on ScrollTrigger, Observer, Flip, SplitText, DrawSVG, MorphSVG, Draggable usage.

## 7. Out of Scope (next cycles)

- Actual page sections, copy, and content.
- Real SVGs for Draw/Morph effects.
- Any specific hero/section choreography.

This spec covers foundation only: tokens, GSAP scaffolding, conventions, and `CLAUDE.md`.
