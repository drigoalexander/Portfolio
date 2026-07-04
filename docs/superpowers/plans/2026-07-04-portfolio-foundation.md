# Portfolio Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the visual + animation foundation for the portfolio — design tokens, a DRY/SOLID GSAP architecture, component conventions, and `CLAUDE.md` — with no page content yet.

**Architecture:** Tailwind v4 CSS-first `@theme` tokens (two raw ramps + semantic aliases, dark-only). GSAP centralized in `src/lib/gsap/`: a single registration module, signature eases, cleanup-safe composables (one effect per file, uniform `{ target, ctx, kill }` contract), and a declarative `[data-anim]` enhancer for static content. Astro = static/presentational; Vue islands = interactive. A `/styleguide` page is the living test harness for tokens and effects.

**Tech Stack:** Astro 7, Vue 3 (`@astrojs/vue`), Tailwind CSS v4 (`@tailwindcss/vite`), GSAP 3.15 (all plugins), Vitest (pure-logic unit tests), Bun (package manager).

## Global Constraints

- **Package manager:** Bun. Use `bun run <script>` and `bunx <bin>`. Never introduce npm/yarn/pnpm lockfiles.
- **Node engine:** `>=22.12.0` (do not lower).
- **TypeScript:** strict (extends `astro/tsconfigs/strict`). No `any` without justification.
- **Dev server:** background mode — `bunx astro dev --background`; manage with `astro dev stop|status|logs`.
- **Theme:** dark-only. No light-mode variants, no `data-theme` switching.
- **Token law:** components use semantic tokens only (`bg-bg`, `text-ink`, `text-accent`, `border-border`). Raw ramps (`dusk-*`, `gold-*`) only for intentional tints/shades. Never hardcode hex in components.
- **GSAP law:** plugins are registered exactly once (in `register.ts`). Components never `import gsap` directly for effects — they use composables or `[data-anim]`. Every animation is wrapped in `gsap.context()` and cleaned up. `prefers-reduced-motion: reduce` must resolve animations to their final visible state instantly.
- **SSR safety:** all GSAP code is client-only and guarded by `typeof window !== 'undefined'`.
- **Exact palette hex** (do not re-sample or alter):
  - dusk: `950 #080705`, `900 #14110B`, `800 #211D11`, `700 #24241A`, `600 #383E3A`, `500 #484E42`, `400 #6B6E60`, `300 #8E9083`, `200 #B4B5AB`, `100 #D2D2C9`, `50 #E9E7DE`
  - gold: `50 #FFF6E6`, `100 #FFDEA9`, `200 #FFD08E`, `300 #FAC984`, `400 #E1B479`, `500 #C19968`, `600 #A97F4E`, `700 #996E43`, `800 #6E4A26`, `900 #513213`

**Verification strategy:** Pure logic (eases, the `[data-anim]` attribute parser) is unit-tested with Vitest. DOM/ScrollTrigger/SplitText effects — which are flaky under jsdom — are verified by `bunx astro check` (typecheck) plus a live demo block on `/styleguide`. This is deliberate: a live harness is a more honest gate for visual animation than a mocked DOM.

---

### Task 1: Design tokens + styleguide harness

**Files:**
- Modify: `src/styles/global.css`
- Create: `src/pages/styleguide.astro`
- Modify: `src/layouts/Layout.astro`

**Interfaces:**
- Produces: CSS utilities `bg-bg`, `bg-surface`, `bg-surface-raised`, `text-ink`, `text-ink-soft`, `text-muted`, `text-accent`, `text-accent-strong`, `border-border`, color ramps `dusk-*`/`gold-*`; the `.bg-sun` and `.film-grain` utilities; font tokens `--font-display`, `--font-sans`. `Layout.astro` becomes a reusable shell accepting a `title` prop and a default slot.

- [ ] **Step 1: Write the token stylesheet**

Replace the entire contents of `src/styles/global.css`:

```css
@import "tailwindcss";

@theme {
  /* ---- raw ramp: dusk (cool neutrals) ---- */
  --color-dusk-950: #080705;
  --color-dusk-900: #14110b;
  --color-dusk-800: #211d11;
  --color-dusk-700: #24241a;
  --color-dusk-600: #383e3a;
  --color-dusk-500: #484e42;
  --color-dusk-400: #6b6e60;
  --color-dusk-300: #8e9083;
  --color-dusk-200: #b4b5ab;
  --color-dusk-100: #d2d2c9;
  --color-dusk-50:  #e9e7de;

  /* ---- raw ramp: gold (the sun) ---- */
  --color-gold-50:  #fff6e6;
  --color-gold-100: #ffdea9;
  --color-gold-200: #ffd08e;
  --color-gold-300: #fac984;
  --color-gold-400: #e1b479;
  --color-gold-500: #c19968;
  --color-gold-600: #a97f4e;
  --color-gold-700: #996e43;
  --color-gold-800: #6e4a26;
  --color-gold-900: #513213;

  /* ---- semantic aliases (dark-only) ---- */
  --color-bg:             var(--color-dusk-950);
  --color-surface:        var(--color-dusk-800);
  --color-surface-raised: var(--color-dusk-700);
  --color-border:         var(--color-dusk-600);
  --color-muted:          #7c6d50;
  --color-ink:            var(--color-gold-100);
  --color-ink-soft:       var(--color-dusk-100);
  --color-accent:         var(--color-gold-300);
  --color-accent-strong:  var(--color-gold-200);
  --color-accent-deep:    var(--color-gold-900);

  /* ---- typography slots (self-hosted fonts arrive next cycle) ---- */
  --font-display: ui-serif, Georgia, "Times New Roman", serif;
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

/* atmosphere: radial golden-hour backlight */
@utility bg-sun {
  background-image: radial-gradient(
    120% 90% at 50% 88%,
    var(--color-gold-200) 0%,
    var(--color-gold-500) 14%,
    var(--color-gold-900) 34%,
    var(--color-dusk-950) 68%
  );
}

/* atmosphere: film grain overlay — apply to a relatively-positioned layer */
@utility film-grain {
  position: relative;
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.06;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
}

@layer base {
  html {
    color-scheme: dark;
  }
  body {
    background-color: var(--color-bg);
    color: var(--color-ink-soft);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  h1, h2, h3 {
    font-family: var(--font-display);
    color: var(--color-ink);
  }
  ::selection {
    background-color: var(--color-accent);
    color: var(--color-dusk-950);
  }
  /* reduced-motion global safety net */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

- [ ] **Step 2: Make `Layout.astro` a reusable shell**

Replace the contents of `src/layouts/Layout.astro`:

```astro
---
import "../styles/global.css";

interface Props {
  title?: string;
}
const { title = "Drigo" } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Create the styleguide harness page**

Create `src/pages/styleguide.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";

const dusk = [950, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50];
const gold = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const semantic = [
  "bg", "surface", "surface-raised", "border",
  "muted", "ink", "ink-soft", "accent", "accent-strong", "accent-deep",
];
---

<Layout title="Styleguide">
  <main class="min-h-screen bg-bg text-ink-soft px-8 py-16 space-y-16">
    <header class="space-y-2">
      <h1 class="text-5xl text-ink">Foundation Styleguide</h1>
      <p class="text-muted">Tokens &amp; animation harness — dark-only.</p>
    </header>

    <section class="space-y-4">
      <h2 class="text-2xl text-accent">Semantic tokens</h2>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        {semantic.map((t) => (
          <div class="rounded-lg border border-border overflow-hidden">
            <div class="h-16" style={`background-color: var(--color-${t})`}></div>
            <div class="p-2 text-xs text-ink-soft">--color-{t}</div>
          </div>
        ))}
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-2xl text-accent">dusk</h2>
      <div class="flex flex-wrap gap-2">
        {dusk.map((n) => (
          <div class="w-20">
            <div class="h-14 rounded border border-border" style={`background-color: var(--color-dusk-${n})`}></div>
            <div class="text-[10px] text-muted mt-1">{n}</div>
          </div>
        ))}
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-2xl text-accent">gold</h2>
      <div class="flex flex-wrap gap-2">
        {gold.map((n) => (
          <div class="w-20">
            <div class="h-14 rounded border border-border" style={`background-color: var(--color-gold-${n})`}></div>
            <div class="text-[10px] text-muted mt-1">{n}</div>
          </div>
        ))}
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-2xl text-accent">Atmosphere</h2>
      <div class="bg-sun film-grain h-64 rounded-2xl grid place-items-center">
        <span class="text-dusk-950 font-display text-3xl">golden hour</span>
      </div>
    </section>
  </main>
</Layout>
```

- [ ] **Step 4: Verify the build and render**

Run: `bunx astro check && bunx astro build`
Expected: check reports 0 errors; build completes writing `dist/styleguide/index.html`.

Then, for a visual pass:
Run: `bunx astro dev --background` and open `http://localhost:4321/styleguide`
Expected: all swatches render with the correct colors; the "golden hour" panel shows the radial sun gradient with visible grain; headings render in the serif display font, cream-colored.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/layouts/Layout.astro src/pages/styleguide.astro
git commit -m "feat: dark-only design tokens + styleguide harness"
```

---

### Task 2: Vitest test tooling

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/__tests__/sanity.test.ts`

**Interfaces:**
- Produces: a `bun run test` script; Vitest resolvable across `src/**`.

- [ ] **Step 1: Install Vitest**

Run: `bun add -d vitest`
Expected: `vitest` appears under `devDependencies` in `package.json`; `bun.lock` updates.

- [ ] **Step 2: Add the test script**

In `package.json`, add to `"scripts"` (keep existing entries):

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Write a sanity test (proves the harness runs and fails correctly)**

Create `src/lib/__tests__/sanity.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the tests**

Run: `bun run test`
Expected: 1 file, 1 test, PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json bun.lock vitest.config.ts src/lib/__tests__/sanity.test.ts
git commit -m "chore: add vitest for pure-logic unit tests"
```

---

### Task 3: GSAP registration core + signature eases

**Files:**
- Create: `src/lib/gsap/eases.ts`
- Create: `src/lib/gsap/eases.test.ts`
- Create: `src/lib/gsap/register.ts`
- Create: `src/lib/gsap/reduced-motion.ts`

**Interfaces:**
- Consumes: `gsap` and plugins from the `gsap` package.
- Produces:
  - `eases.ts`: `export const EASES = { hop: string; sweep: string; glide: string }` and `export function registerEases(): void`.
  - `reduced-motion.ts`: `export function prefersReducedMotion(): boolean`.
  - `register.ts`: `export function registerGsap(): typeof gsap` (idempotent; registers all plugins + eases + defaults once) and re-exports `gsap`, `ScrollTrigger`, `Observer`, `Flip`, `SplitText`, `Draggable`.

- [ ] **Step 1: Write the failing test for eases**

Create `src/lib/gsap/eases.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import gsap from "gsap";
import { EASES, registerEases } from "./eases";

describe("signature eases", () => {
  it("registers named eases that behave as easing functions", () => {
    registerEases();
    for (const name of Object.values(EASES)) {
      const ease = gsap.parseEase(name);
      expect(typeof ease).toBe("function");
      expect(ease(0)).toBeCloseTo(0, 5);
      expect(ease(1)).toBeCloseTo(1, 5);
    }
  });

  it("is idempotent (double registration does not throw)", () => {
    expect(() => {
      registerEases();
      registerEases();
    }).not.toThrow();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `bun run test src/lib/gsap/eases.test.ts`
Expected: FAIL — cannot resolve `./eases`.

- [ ] **Step 3: Implement `eases.ts`**

Create `src/lib/gsap/eases.ts`:

```ts
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

/** Named signature eases — the single source of truth for motion feel. */
export const EASES = {
  /** decisive entrance, slight overshoot-free settle */
  hop: "hop",
  /** long cinematic sweep for hero + section reveals */
  sweep: "sweep",
  /** soft glide for micro-interactions */
  glide: "glide",
} as const;

let registered = false;

export function registerEases(): void {
  if (registered) return;
  gsap.registerPlugin(CustomEase);
  CustomEase.create(EASES.hop, "M0,0 C0.14,1 0.4,1 1,1");
  CustomEase.create(EASES.sweep, "M0,0 C0.6,0 0.05,1 1,1");
  CustomEase.create(EASES.glide, "M0,0 C0.25,0.1 0.25,1 1,1");
  registered = true;
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `bun run test src/lib/gsap/eases.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Implement `reduced-motion.ts`**

Create `src/lib/gsap/reduced-motion.ts`:

```ts
/** SSR-safe check for the user's reduced-motion preference. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
```

- [ ] **Step 6: Implement `register.ts` (single registration point)**

Create `src/lib/gsap/register.ts`:

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { registerEases, EASES } from "./eases";

let registered = false;

/**
 * Registers every GSAP plugin exactly once and applies global defaults.
 * SSR-safe: no-ops on the server. Returns the configured `gsap` instance.
 */
export function registerGsap(): typeof gsap {
  if (registered || typeof window === "undefined") return gsap;

  gsap.registerPlugin(
    ScrollTrigger,
    Observer,
    Flip,
    SplitText,
    Draggable,
    InertiaPlugin,
    DrawSVGPlugin,
    MorphSVGPlugin,
    ScrollToPlugin,
  );
  registerEases();

  gsap.defaults({ ease: EASES.sweep, duration: 0.9 });
  ScrollTrigger.config({ ignoreMobileResize: true });

  registered = true;
  return gsap;
}

export { gsap, ScrollTrigger, Observer, Flip, SplitText, Draggable };
```

- [ ] **Step 7: Typecheck**

Run: `bunx astro check`
Expected: 0 errors. (If any plugin path fails to resolve, confirm the file exists under `node_modules/gsap/` — all listed plugins ship with gsap 3.15.)

- [ ] **Step 8: Commit**

```bash
git add src/lib/gsap/eases.ts src/lib/gsap/eases.test.ts src/lib/gsap/register.ts src/lib/gsap/reduced-motion.ts
git commit -m "feat: centralized GSAP registration + signature eases"
```

---

### Task 4: Declarative `[data-anim]` enhancer

**Files:**
- Create: `src/lib/gsap/autoAnimate.ts`
- Create: `src/lib/gsap/autoAnimate.test.ts`

**Interfaces:**
- Consumes: `registerGsap` from `./register`, `prefersReducedMotion` from `./reduced-motion`, `EASES` from `./eases`.
- Produces:
  - `export type AnimKind = "reveal" | "split" | "parallax" | "draw"`
  - `export interface AnimConfig { kind: AnimKind; delay: number; duration?: number; y: number; from: number; }`
  - `export function parseAnimAttrs(el: Element): AnimConfig | null` (pure — unit tested)
  - `export function autoAnimate(root?: ParentNode): () => void` (DOM wiring; returns a cleanup fn)

- [ ] **Step 1: Write the failing test for the pure parser**

Create `src/lib/gsap/autoAnimate.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseAnimAttrs } from "./autoAnimate";

function el(attrs: Record<string, string>): Element {
  const e = { getAttribute: (k: string) => attrs[k] ?? null } as unknown as Element;
  return e;
}

describe("parseAnimAttrs", () => {
  it("returns null when data-anim is absent", () => {
    expect(parseAnimAttrs(el({}))).toBeNull();
  });

  it("parses a reveal with defaults", () => {
    const cfg = parseAnimAttrs(el({ "data-anim": "reveal" }));
    expect(cfg).toEqual({ kind: "reveal", delay: 0, duration: undefined, y: 24, from: 0 });
  });

  it("parses modifiers", () => {
    const cfg = parseAnimAttrs(
      el({ "data-anim": "parallax", "data-anim-delay": "0.2", "data-anim-y": "80" }),
    );
    expect(cfg?.kind).toBe("parallax");
    expect(cfg?.delay).toBe(0.2);
    expect(cfg?.y).toBe(80);
  });

  it("ignores unknown kinds", () => {
    expect(parseAnimAttrs(el({ "data-anim": "wobble" }))).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `bun run test src/lib/gsap/autoAnimate.test.ts`
Expected: FAIL — cannot resolve `./autoAnimate`.

- [ ] **Step 3: Implement `autoAnimate.ts`**

Create `src/lib/gsap/autoAnimate.ts`:

```ts
import { registerGsap, ScrollTrigger, SplitText } from "./register";
import { prefersReducedMotion } from "./reduced-motion";
import { EASES } from "./eases";

const KINDS = ["reveal", "split", "parallax", "draw"] as const;
export type AnimKind = (typeof KINDS)[number];

export interface AnimConfig {
  kind: AnimKind;
  delay: number;
  duration?: number;
  y: number;
  from: number;
}

function num(el: Element, attr: string, fallback: number): number {
  const raw = el.getAttribute(attr);
  if (raw === null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** Pure: maps an element's data-anim attributes to a config (or null). */
export function parseAnimAttrs(el: Element): AnimConfig | null {
  const kind = el.getAttribute("data-anim");
  if (!kind || !KINDS.includes(kind as AnimKind)) return null;
  const durRaw = el.getAttribute("data-anim-duration");
  return {
    kind: kind as AnimKind,
    delay: num(el, "data-anim-delay", 0),
    duration: durRaw === null ? undefined : Number(durRaw),
    y: num(el, "data-anim-y", 24),
    from: num(el, "data-anim-from", 0),
  };
}

/**
 * Scans `root` for `[data-anim]` elements and wires each to a scroll-triggered
 * animation. Returns a cleanup function. SSR-safe. Honors reduced motion by
 * leaving elements in their final visible state.
 */
export function autoAnimate(root: ParentNode = document): () => void {
  if (typeof window === "undefined") return () => {};
  const gsap = registerGsap();
  const reduce = prefersReducedMotion();
  const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-anim]"));

  const ctx = gsap.context(() => {
    for (const el of nodes) {
      const cfg = parseAnimAttrs(el);
      if (!cfg) continue;

      if (reduce) {
        gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });
        continue;
      }

      const st = { trigger: el, start: "top 85%", once: true } as const;

      switch (cfg.kind) {
        case "reveal":
          gsap.from(el, {
            opacity: 0, y: cfg.y, duration: cfg.duration ?? 0.9,
            delay: cfg.delay, ease: EASES.sweep, scrollTrigger: st,
          });
          break;
        case "split": {
          const split = new SplitText(el, { type: "lines,words", linesClass: "sg-line" });
          gsap.from(split.words, {
            opacity: 0, yPercent: 120, stagger: 0.03,
            duration: cfg.duration ?? 0.8, delay: cfg.delay,
            ease: EASES.hop, scrollTrigger: st,
          });
          break;
        }
        case "parallax":
          gsap.to(el, {
            yPercent: -(cfg.y / 4), ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
          break;
        case "draw":
          gsap.from(el.querySelectorAll("path, line, polyline, circle, rect"), {
            drawSVG: "0%", duration: cfg.duration ?? 1.4,
            delay: cfg.delay, ease: EASES.glide, scrollTrigger: st,
          });
          break;
      }
    }
  }, root instanceof Element ? root : undefined);

  return () => {
    ctx.revert();
    ScrollTrigger.refresh();
  };
}
```

- [ ] **Step 4: Run the parser test to confirm it passes**

Run: `bun run test src/lib/gsap/autoAnimate.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Typecheck**

Run: `bunx astro check`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/gsap/autoAnimate.ts src/lib/gsap/autoAnimate.test.ts
git commit -m "feat: declarative [data-anim] enhancer for static content"
```

---

### Task 5: Reveal/scroll composables

**Files:**
- Create: `src/lib/gsap/composables/types.ts`
- Create: `src/lib/gsap/composables/useScrollReveal.ts`
- Create: `src/lib/gsap/composables/useSplitReveal.ts`
- Create: `src/lib/gsap/composables/useParallax.ts`

**Interfaces:**
- Consumes: `registerGsap`, `ScrollTrigger`, `SplitText` from `../register`; `prefersReducedMotion`; `EASES`.
- Produces:
  - `types.ts`: `export interface AnimHandle { ctx: gsap.Context; kill: () => void }` and `export type Target = string | Element | Element[]`.
  - `useScrollReveal(target: Target, opts?: { y?: number; stagger?: number; start?: string; duration?: number }): AnimHandle`
  - `useSplitReveal(target: Target, opts?: { stagger?: number; start?: string; type?: string }): AnimHandle`
  - `useParallax(target: Target, opts?: { amount?: number }): AnimHandle`

Every composable: SSR-safe, wrapped in `gsap.context()`, honors reduced motion (sets final state), returns a uniform `AnimHandle`.

- [ ] **Step 1: Define the shared contract**

Create `src/lib/gsap/composables/types.ts`:

```ts
import gsap from "gsap";

export type Target = string | Element | Element[];

/** The object returned by gsap.context() — scoped selectors + revert(). */
export type AnimContext = ReturnType<typeof gsap.context>;

/** Uniform return contract for every composable (ISP). */
export interface AnimHandle {
  ctx: AnimContext;
  kill: () => void;
}

/** Builds a handle from a context, wiring kill() to full revert. */
export function toHandle(ctx: AnimContext): AnimHandle {
  return { ctx, kill: () => ctx.revert() };
}
```

- [ ] **Step 2: Implement `useScrollReveal`**

Create `src/lib/gsap/composables/useScrollReveal.ts`:

```ts
import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { EASES } from "../eases";
import { toHandle, type AnimHandle, type Target } from "./types";

export function useScrollReveal(
  target: Target,
  opts: { y?: number; stagger?: number; start?: string; duration?: number } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { y = 28, stagger = 0.08, start = "top 85%", duration = 0.9 } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    if (reduce) {
      gsap.set(target, { opacity: 1, y: 0 });
      return;
    }
    gsap.from(target, {
      opacity: 0, y, duration, stagger, ease: EASES.sweep,
      scrollTrigger: { trigger: target as gsap.DOMTarget, start, once: true },
    });
  });

  return toHandle(ctx);
}
```

- [ ] **Step 3: Implement `useSplitReveal`**

Create `src/lib/gsap/composables/useSplitReveal.ts`:

```ts
import { registerGsap, SplitText } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { EASES } from "../eases";
import { toHandle, type AnimHandle, type Target } from "./types";

export function useSplitReveal(
  target: Target,
  opts: { stagger?: number; start?: string; type?: string } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { stagger = 0.03, start = "top 85%", type = "lines,words" } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    if (reduce) {
      gsap.set(target, { opacity: 1 });
      return;
    }
    const split = new SplitText(target as gsap.DOMTarget, { type, linesClass: "sr-line" });
    gsap.from(split.words, {
      opacity: 0, yPercent: 120, stagger, duration: 0.8, ease: EASES.hop,
      scrollTrigger: { trigger: target as gsap.DOMTarget, start, once: true },
    });
  });

  return toHandle(ctx);
}
```

- [ ] **Step 4: Implement `useParallax`**

Create `src/lib/gsap/composables/useParallax.ts`:

```ts
import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { toHandle, type AnimHandle, type Target } from "./types";

export function useParallax(
  target: Target,
  opts: { amount?: number } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { amount = 20 } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    if (reduce) return;
    gsap.to(target, {
      yPercent: -amount, ease: "none",
      scrollTrigger: {
        trigger: target as gsap.DOMTarget,
        start: "top bottom", end: "bottom top", scrub: true,
      },
    });
  });

  return toHandle(ctx);
}
```

- [ ] **Step 5: Typecheck**

Run: `bunx astro check`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/gsap/composables/types.ts src/lib/gsap/composables/useScrollReveal.ts src/lib/gsap/composables/useSplitReveal.ts src/lib/gsap/composables/useParallax.ts
git commit -m "feat: scroll/reveal composables (contract + reveal/split/parallax)"
```

---

### Task 6: Interaction + SVG/layout composables

**Files:**
- Create: `src/lib/gsap/composables/useMagnetic.ts`
- Create: `src/lib/gsap/composables/useHorizontalScroll.ts`
- Create: `src/lib/gsap/composables/useDraggable.ts`
- Create: `src/lib/gsap/composables/useDrawSVG.ts`
- Create: `src/lib/gsap/composables/useFlip.ts`

**Interfaces:**
- Consumes: `registerGsap`, `Observer`, `Draggable`, `Flip` from `../register`; `prefersReducedMotion`; `EASES`; `toHandle`, `AnimHandle`, `Target`.
- Produces:
  - `useMagnetic(el: HTMLElement, opts?: { strength?: number }): AnimHandle`
  - `useHorizontalScroll(container: HTMLElement, track: HTMLElement): AnimHandle`
  - `useDraggable(target: Target, opts?: { inertia?: boolean; bounds?: Element | string }): AnimHandle`
  - `useDrawSVG(target: Target, opts?: { duration?: number; start?: string }): AnimHandle`
  - `captureFlip(target: Target): gsap.Flip.FlipState` and `useFlip(state: gsap.Flip.FlipState, opts?: { duration?: number }): AnimHandle`

- [ ] **Step 1: Implement `useMagnetic`**

Create `src/lib/gsap/composables/useMagnetic.ts`:

```ts
import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { EASES } from "../eases";
import { toHandle, type AnimHandle } from "./types";

export function useMagnetic(
  el: HTMLElement,
  opts: { strength?: number } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { strength = 0.4 } = opts;

  if (prefersReducedMotion()) {
    return { ctx: gsap.context(() => {}), kill: () => {} };
  }

  const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: EASES.glide });
  const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: EASES.glide });

  const move = (e: MouseEvent) => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - (r.left + r.width / 2)) * strength);
    yTo((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { xTo(0); yTo(0); };

  const ctx = gsap.context(() => {
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", reset);
  });

  return {
    ctx,
    kill: () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", reset);
      ctx.revert();
    },
  };
}
```

- [ ] **Step 2: Implement `useHorizontalScroll`**

Create `src/lib/gsap/composables/useHorizontalScroll.ts`:

```ts
import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { toHandle, type AnimHandle } from "./types";

/** Pins `container` and scrolls `track` horizontally on vertical scroll. */
export function useHorizontalScroll(
  container: HTMLElement,
  track: HTMLElement,
): AnimHandle {
  const gsap = registerGsap();

  const ctx = gsap.context(() => {
    if (prefersReducedMotion()) return;
    const distance = () => track.scrollWidth - container.offsetWidth;
    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 1,
        end: () => "+=" + distance(),
        invalidateOnRefresh: true,
      },
    });
  }, container);

  return toHandle(ctx);
}
```

- [ ] **Step 3: Implement `useDraggable`**

Create `src/lib/gsap/composables/useDraggable.ts`:

```ts
import { registerGsap, Draggable } from "../register";
import { toHandle, type AnimHandle, type Target } from "./types";

export function useDraggable(
  target: Target,
  opts: { inertia?: boolean; bounds?: Element | string } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { inertia = true, bounds } = opts;

  const ctx = gsap.context(() => {
    Draggable.create(target as gsap.DOMTarget, {
      type: "x,y",
      inertia,
      bounds,
      edgeResistance: 0.75,
    });
  });

  return toHandle(ctx);
}
```

- [ ] **Step 4: Implement `useDrawSVG`**

Create `src/lib/gsap/composables/useDrawSVG.ts`:

```ts
import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { EASES } from "../eases";
import { toHandle, type AnimHandle, type Target } from "./types";

export function useDrawSVG(
  target: Target,
  opts: { duration?: number; start?: string } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { duration = 1.4, start = "top 85%" } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    if (reduce) {
      gsap.set(target, { drawSVG: "100%" });
      return;
    }
    gsap.from(target, {
      drawSVG: "0%", duration, ease: EASES.glide,
      scrollTrigger: { trigger: target as gsap.DOMTarget, start, once: true },
    });
  });

  return toHandle(ctx);
}
```

- [ ] **Step 5: Implement `useFlip`**

Create `src/lib/gsap/composables/useFlip.ts`:

```ts
import { registerGsap, Flip } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { EASES } from "../eases";
import { toHandle, type AnimHandle, type Target } from "./types";

/** Capture layout state BEFORE a DOM/class change. */
export function captureFlip(target: Target): Flip.FlipState {
  registerGsap();
  return Flip.getState(target as gsap.DOMTarget);
}

/** Animate FROM a captured state to the current layout. Call after the change. */
export function useFlip(
  state: Flip.FlipState,
  opts: { duration?: number } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { duration = 0.7 } = opts;

  const ctx = gsap.context(() => {
    Flip.from(state, {
      duration: prefersReducedMotion() ? 0 : duration,
      ease: EASES.hop,
      absolute: true,
    });
  });

  return toHandle(ctx);
}
```

- [ ] **Step 6: Typecheck**

Run: `bunx astro check`
Expected: 0 errors. If `Flip.FlipState` type import fails, use `ReturnType<typeof Flip.getState>` in place of `Flip.FlipState`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/gsap/composables/useMagnetic.ts src/lib/gsap/composables/useHorizontalScroll.ts src/lib/gsap/composables/useDraggable.ts src/lib/gsap/composables/useDrawSVG.ts src/lib/gsap/composables/useFlip.ts
git commit -m "feat: interaction + SVG/layout composables"
```

---

### Task 7: Barrel entry + client bootstrap + live island demo

**Files:**
- Create: `src/lib/gsap/index.ts`
- Modify: `src/layouts/Layout.astro`
- Create: `src/components/islands/MagneticButton.vue`
- Modify: `src/pages/styleguide.astro`

**Interfaces:**
- Consumes: everything from Tasks 3–6.
- Produces:
  - `index.ts`: `export function initGsap(): void` (calls `registerGsap()` + `autoAnimate()` on the client) and barrel `export * from` each composable + `registerGsap`, `EASES`.
  - `MagneticButton.vue`: a "clever" Vue island demonstrating `useMagnetic` with `onMounted`/`onUnmounted` cleanup.

- [ ] **Step 1: Create the barrel + `initGsap`**

Create `src/lib/gsap/index.ts`:

```ts
import { registerGsap } from "./register";
import { autoAnimate } from "./autoAnimate";

export { registerGsap } from "./register";
export { EASES } from "./eases";
export { prefersReducedMotion } from "./reduced-motion";
export { autoAnimate, parseAnimAttrs } from "./autoAnimate";
export * from "./composables/types";
export { useScrollReveal } from "./composables/useScrollReveal";
export { useSplitReveal } from "./composables/useSplitReveal";
export { useParallax } from "./composables/useParallax";
export { useMagnetic } from "./composables/useMagnetic";
export { useHorizontalScroll } from "./composables/useHorizontalScroll";
export { useDraggable } from "./composables/useDraggable";
export { useDrawSVG } from "./composables/useDrawSVG";
export { captureFlip, useFlip } from "./composables/useFlip";

/** Client entry: register GSAP and wire declarative [data-anim] content. */
export function initGsap(): void {
  if (typeof window === "undefined") return;
  registerGsap();
  autoAnimate(document);
}
```

- [ ] **Step 2: Bootstrap GSAP globally from `Layout.astro`**

In `src/layouts/Layout.astro`, add this `<script>` immediately before the closing `</body>` (after `<slot />`):

```astro
    <slot />
    <script>
      import { initGsap } from "../lib/gsap";
      initGsap();
    </script>
  </body>
```

- [ ] **Step 3: Create the `MagneticButton` island (clever/interactive)**

Create `src/components/islands/MagneticButton.vue`:

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useMagnetic, type AnimHandle } from "../../lib/gsap";

const props = withDefaults(defineProps<{ label?: string }>(), { label: "Hover me" });
const el = ref<HTMLButtonElement | null>(null);
let handle: AnimHandle | null = null;

onMounted(() => {
  if (el.value) handle = useMagnetic(el.value, { strength: 0.5 });
});
onUnmounted(() => handle?.kill());
</script>

<template>
  <button
    ref="el"
    class="inline-flex items-center gap-2 rounded-full border border-accent bg-surface px-8 py-4 text-ink"
  >
    {{ props.label }}
  </button>
</template>
```

- [ ] **Step 4: Add live demos to the styleguide**

In `src/pages/styleguide.astro`, add this import at the top of the frontmatter (after the Layout import):

```astro
import MagneticButton from "../components/islands/MagneticButton.vue";
```

Then add this section inside `<main>`, after the Atmosphere section:

```astro
    <section class="space-y-8">
      <h2 class="text-2xl text-accent">Motion harness</h2>

      <p data-anim="reveal" class="text-ink-soft max-w-prose">
        This paragraph reveals on scroll via the declarative [data-anim] layer —
        zero per-component JS.
      </p>

      <h3 data-anim="split" class="text-4xl text-ink max-w-3xl">
        Split-text headings sweep in word by word as they enter the viewport.
      </h3>

      <div class="py-8">
        <MagneticButton client:visible label="Magnetic button" />
      </div>
    </section>
```

- [ ] **Step 5: Typecheck and build**

Run: `bunx astro check && bunx astro build`
Expected: 0 errors; build succeeds.

- [ ] **Step 6: Verify motion in the browser**

Run: `bunx astro dev --background`, open `http://localhost:4321/styleguide`.
Expected: the paragraph fades/rises on scroll; the heading splits into words that sweep up; the magnetic button follows the cursor and springs back on leave.
Then set the OS to "Reduce motion" (or emulate via DevTools Rendering → prefers-reduced-motion) and reload.
Expected: all content is immediately visible/legible with no motion; the magnetic button does not translate.

- [ ] **Step 7: Commit**

```bash
git add src/lib/gsap/index.ts src/layouts/Layout.astro src/components/islands/MagneticButton.vue src/pages/styleguide.astro
git commit -m "feat: initGsap bootstrap + magnetic-button island demo"
```

---

### Task 8: Rewrite `CLAUDE.md` (`AGENTS.md`) with conventions

**Files:**
- Modify: `AGENTS.md` (`CLAUDE.md` is a symlink to it — edit `AGENTS.md`)

**Interfaces:** none (documentation).

- [ ] **Step 1: Replace `AGENTS.md` with the full conventions doc**

Overwrite `AGENTS.md`:

```markdown
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
```

- [ ] **Step 2: Verify the symlink still resolves**

Run: `cat CLAUDE.md`
Expected: prints the new `AGENTS.md` content (confirms the symlink is intact).

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "docs: rewrite agent guide with token + GSAP + component conventions"
```

---

## Self-Review

**Spec coverage:**
- §3 tokens → Task 1. ✓
- §4 GSAP (register, eases, composables, autoAnimate, index/initGsap) → Tasks 3, 4, 5, 6, 7. ✓
- §5 component pattern (ui/sections/islands dirs, dumb/clever) → Task 7 (islands dir + demo) and Task 8 (documented conventions). `ui/` and `sections/` dirs are created lazily when first content lands (next cycle) — documented in Task 8; no empty dirs committed. ✓
- §6 CLAUDE.md rewrite → Task 8. ✓
- Reduced motion → global CSS (Task 1) + every composable + autoAnimate. ✓
- Verification strategy (Vitest + styleguide) → Task 2 + live demos in Tasks 1 & 7. ✓

**Placeholder scan:** No TBD/TODO; all code blocks complete; every command has expected output.

**Type consistency:** `AnimHandle { ctx, kill }` defined in Task 5 `types.ts`, consumed identically in Tasks 6 & 7. `registerGsap()` returns `typeof gsap` (Task 3), used everywhere. `EASES` keys `hop|sweep|glide` consistent across eases.ts and all consumers. `parseAnimAttrs`/`autoAnimate` signatures match between Task 4 definition and Task 7 barrel export.

**Known adaptation note:** if `Flip.FlipState` / `gsap.DOMTarget` type names differ in the installed `@types`, fall back to `ReturnType<typeof Flip.getState>` and `gsap.TweenTarget` respectively (called out inline in Task 6 Step 6).
