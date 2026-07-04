# Build Prompt — Drigo Alexander, Cinematic Portfolio Landing

> Feed this to an implementation agent (or use with `superpowers:brainstorming`
> → `writing-plans` → `executing-plans`). It is self-contained but assumes the
> repo's existing foundation. Copy is **placeholder** — structure and motion are
> the deliverable; real words swap in later.

---

## Role & goal

You are building a **single-page cinematic portfolio landing** for **Drigo
Alexander**, a Software Engineer. The page tells one story: **an inward journey
of growth and self-knowledge**, whose outward shadow is a path from **local
(a small company in Indonesia)** to **international (an AI company in the US)**.

The geography is never the point — it is the *evidence* of growth. Do **not**
use planes, maps, globes, or boarding-pass metaphors. The story is about
*becoming*, told through scale and clarity.

## Stack & foundation (already in the repo — use it, don't reinvent)

- **Astro 7 + Vue 3 islands + Tailwind v4 + GSAP 3.15.** Bun. Dark-first, warm.
- **Design tokens** — semantic only (`bg`, `surface`, `ink`, `ink-soft`,
  `muted`, `accent`, `accent-deep`, + a `sand` light-section surface to be
  added). Never hardcode hex. See `src/styles/global.css` and the token law in
  `AGENTS.md`.
- **GSAP** — register once via `src/lib/gsap/register.ts`; use composables /
  `[data-anim]` only; every animation in `gsap.context()`; **`prefers-reduced-
  motion` mandatory** (resolve to final legible state, no motion). See the GSAP
  law in `AGENTS.md`.
- **Components** — Astro = static/presentational scenes; Vue islands = the
  interactive/GSAP "clever" parts (`client:visible`). Dumb takes props; clever
  owns state + effects.
- **Primary visual reference** — `docs/design-reference/sondaven/design-notes.md`.
  Match its warm two-tone palette, high-contrast serif display + wide-tracked
  uppercase grotesque, generous negative space, grain, and slow weighted motion.

## Tone

**Understated premium.** Slow, weighted, restrained. One idea per screen. Vast
negative space. Motion earns attention rather than demanding it. Confidence
through quiet, not spectacle.

## The two signature motion devices (the spine of the whole page)

1. **Noise → clarity = *knowing yourself*.** Section titles and key lines
   arrive **scrambled** (GSAP `ScrambleTextPlugin`) and resolve to clean text as
   they enter. Early scenes resolve slowly/roughly; later scenes resolve crisply
   — clarity increases as self-knowledge grows.
2. **Tight → expansive = *growth*.** The composition **opens up** as you
   descend. The first scenes are cropped, intimate, small-scale (narrow column,
   tight image, lots of dark space). Each scene widens; the final scene is
   full-bleed and expansive. Use scroll-scrubbed `scale`/`clip-path` reveals.
3. **The growth line.** A single thin vertical line (SVG) runs down the page and
   **draws itself** (`DrawSVG`) as you scroll, with a small node at each chapter.
   It is the visible thread of the journey — a spine, not a route. It thickens
   or brightens subtly toward the end.

A persistent, minimal **chapter indicator** (echoing Son Daven's bottom-left
waveform) shows progress through the arc.

## The story — chapters (each ≈ one full-height scene)

Placeholder copy in *italics*; treat as stand-in. Keep one idea per screen.

**00 · Hero — the name.**
Intimate, near-black warm ground. The wordmark **DRIGO ALEXANDER** in the serif
display scrambles → resolves. Eyebrow (tracked grotesque): *SOFTWARE ENGINEER*.
One-line thesis: *"A story about growing — from a small room to the wider world."*
Subtle scroll cue + the growth line begins.

**01 · Origin (local).**
*"IT STARTED SMALL."* A small company in Indonesia — first real role. Tight,
cropped scene; narrow text column; a single small image block. Copy placeholder:
*first job, wearing every hat, learning by shipping.* Meta line: *2018 · Jakarta,
Indonesia* (or placeholder). Frame is at its smallest here.

**02 · Craft.**
*"LEARNING THE CRAFT."* Becoming a real engineer — discipline, fundamentals,
shipping under constraints. Slightly wider frame. Optional animated counter
(e.g. *projects shipped*, *years*). Placeholder body about deliberate practice.

**03 · Knowing myself (the emotional core).**
*"KNOWING MYSELF."* The introspective turn — understanding what actually drives
the work, strengths, and the kind of engineer/person to become. This scene
leans hardest on the **scramble→clarity** device: a paragraph literally resolves
from noise to clarity as the user reads. Quietest, most spacious scene.

**04 · The leap.**
*"THE LEAP."* Choosing to reach beyond the local — the decision, the risk, the
stretch. The frame noticeably **opens up** here (growth accelerates). Transition
from dark ground toward a lighter/expansive treatment.

**05 · Now (international).**
*"NOW — INTERNATIONAL."* An AI company in the US. The **widest, most expansive**
scene: full-bleed, biggest type, the growth line at its brightest. Counters for
scale (e.g. *scale of impact*). Meta line: *Present · United States*. This is the
payoff of the tight→expansive arc.

**06 · Ethos (short).**
*"HOW I WORK."* 2–3 crisp value lines (craft, ownership, clarity). Restrained,
editorial. Optional.

**07 · Contact / epilogue.**
*"LET'S BUILD SOMETHING."* Quiet close. Email + socials (placeholder). A final
scramble→clarity on the sign-off. The growth line terminates in a node.

## New composables to add (follow the existing contract `{ ctx, kill }`)

Add under `src/lib/gsap/composables/`, export from `src/lib/gsap/index.ts`,
register any new plugin in `register.ts`:

- `useScramble(target, opts)` — register + use `ScrambleTextPlugin`; scramble →
  resolve on scroll enter. Reduced-motion: set final text immediately.
- `useClipReveal(target, opts)` — scroll-scrubbed `clip-path`/`scale` "opening"
  reveal for the tight→expansive device.
- `useCounter(target, opts)` — count a number on enter (`snap`), reduced-motion
  shows final value.
- `useGrowthLine(pathEl, opts)` — `DrawSVG` scrub tied to page scroll for the
  spine; nodes light up per chapter.
- `useRotate(target)` — optional continuous rotation for any badge.

Each: SSR-safe, `gsap.context()`, reduced-motion honored, uniform handle.

## Suggested structure

```
src/pages/index.astro                 compose the scenes, mount the growth line
src/layouts/Layout.astro              (exists) — initGsap already wired
src/components/sections/              one Astro file per chapter (00..07), static shell
src/components/islands/               clever Vue islands: Scramble headline, Counter,
                                      GrowthLine, ChapterIndicator
src/content/story.ts                  typed placeholder content (chapters array)
src/lib/gsap/composables/             the new composables above
```

Put **all placeholder copy in `src/content/story.ts`** as a typed array of
chapters (`id`, `eyebrow`, `title`, `body`, `meta`, `image?`, `stat?`) so real
content swaps in later without touching layout. Sections read from it.

## Design specifics

- **Palette:** dark warm brown ground (`--color-bg`) for early/intimate scenes;
  shift toward the **sand** light surface for the expansive later scenes — the
  ground literally lightens/opens as growth happens. Muted-gold accent
  throughout. Add the `sand` surface token + its ink if missing.
- **Type:** high-contrast **serif** for display/titles; **wide-tracked uppercase
  grotesque** for eyebrows, meta, body, buttons. (Self-hosted fonts may be a
  follow-up; use the `--font-display` serif slot + a tracked uppercase style
  meanwhile.)
- **Imagery:** cinematic placeholder blocks (solid warm panels or a neutral
  placeholder) that clip/scale-reveal; add `film-grain`. No stock clichés.
- **Chrome:** minimal top bar (wordmark + a single CTA pill), the chapter
  indicator, the growth line. Nothing else competes.

## Non-negotiables

- Semantic tokens only; no hardcoded hex in components.
- All motion through composables/`[data-anim]`; registered once; `gsap.context()`
  cleanup; **reduced-motion resolves to final legible state** (test it).
- Astro static scenes + Vue islands for interactivity; keep files focused.
- Accessible: semantic landmarks, one `<h1>`, keyboard/focus states, sufficient
  contrast in both dark and sand scenes.
- Performance: lazy-hydrate islands, avoid layout shift, transforms over layout
  props.

## Done when

- The full arc (00→07) reads as one story; the tight→expansive and
  noise→clarity devices are felt, not just present.
- Verified in a real browser (drive scroll): scramble resolves, growth line
  draws, frames open up, counters run — and with `prefers-reduced-motion:
  reduce` everything is immediately legible with no motion.
- `bunx astro check` clean, `bun run test` green, `bunx astro build` succeeds.
- Placeholder content lives entirely in `src/content/story.ts`.
```
