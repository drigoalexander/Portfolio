# Son Daven — Design Notes (reference for the portfolio)

Extracted from the captured frames in this folder. This is the aesthetic +
motion target. Colors sampled from screenshots (accurate); the `.mp4` is
H.264-desaturated so trust the PNGs for color.

## The feeling

Cinematic, editorial, luxury-architectural. Warm earthy palette, big
high-contrast serif, lots of negative space, full-bleed 3D architectural
renders, and a signature **glitch / pixel-dissolve** motion motif. Calm and
premium, not flashy — motion is slow, weighted, and scroll-driven.

## Palette (sampled)

Warm, earthy, two-tone. Sections **alternate** between a dark warm ground and a
light sand ground; muted gold/tan is the connective accent.

| Role | Approx hex | Notes |
|---|---|---|
| Dark warm ground | `#1F1D18` – `#26241D` | deep warm brown/olive-black; primary dark bg |
| Deep olive-gray | `#52534F` | darker mid sections |
| Taupe | `#887860` | mid warm neutral |
| Sand / tan ground | `#A69272` – `#A69474` | light section backgrounds |
| Muted gold text/accent | `#B8A47E` – `#C9B48A` | headings & labels on dark |
| Warm dark ink | `#1A1712` | text on sand |

**This validates our existing tokens** (`dusk` warm-dark ramp + `gold` ramp).
What changes vs. our first pass: the ground is a *warm brown*, not near-black;
and we need a **sand "light section" surface** token. Drop the invented radial
"sun" atmosphere (`bg-sun`) — the real atmosphere here is cinematic image
blocks + fine grain + glitch motifs, never a gradient glow.

## Typography

Two families, strong contrast between them:

1. **Display / headings — high-contrast SERIF** (Didone/transitional feel:
   thin hairlines, sharp bracketed serifs). Used large and often UPPERCASE:
   `SON DAVEN`, `ABOUT US`, `CONCEPT`, `THE MOUNTAINS SPEAK`, `FAQ`
   (letters split apart with labels nested between them).
2. **Body / labels / UI — letter-spaced UPPERCASE grotesque** (near-mono,
   wide tracking, distinctive dotted capital `İ`). Used for nav, eyebrows
   (`UNIQUENESS`, `INFRASTRUCTURE`), paragraphs, buttons, list numbers.

Eyebrows get decorative marks: `+++ UNIQUENESS +++`, small underline ticks
beneath section titles.

*Next cycle:* self-host a high-contrast serif (e.g. a Canela/Reckless-like
display) + a wide-tracked uppercase grotesque. Until then our `--font-display`
serif slot is a stand-in.

## Layout patterns

- **Full-bleed architectural renders** as hero and section backgrounds; text
  overlaid with heavy legibility (dark scrim / placement in dark areas).
- **Alternating dark ↔ sand sections** for rhythm.
- **Asymmetric editorial grids:** oversized headline offset to one side, body
  text in a narrow column, image blocks clipped to portrait rectangles.
- **Persistent chrome:** top bar (`MENU · AEROTOUR · SON DAVEN · UA ·
  CONSULTATION` pill), a **waveform indicator** bottom-left, and a **rotating
  circular badge** ("INVEST IN SON DAVEN").
- Numbered accordions (`01 / 02 / 03 …` with `+`), POI maps with ringed markers,
  large animated counters (`INFRASTRUCTURE 31`).
- Buttons: fully-rounded **pill**, solid tan on dark / outline on sand.

## Motion catalog → our GSAP stack

What to reproduce, and the composable/plugin that fits (all plugins are free in
GSAP 3.15). See `src/lib/gsap/`.

| Observed effect | Build with |
|---|---|
| Glitch/scramble text reveal on wordmark + titles | `SplitText` + **ScrambleTextPlugin** → add a `useScramble` composable + register the plugin in `register.ts` |
| Large text **pixel/block dissolve** on scroll | `clip-path`/mask + `ScrollTrigger` scrub → `useClipReveal` |
| Image blocks clip / scale-reveal on enter | `useScrollReveal` (clip-path variant) or `Flip` |
| Parallax pan over renders, pinned sections | `ScrollTrigger` pin + `useParallax` |
| Animated number counters | `ScrollTrigger` + tween a value (`snap`) → `useCounter` |
| Rotating circular badge | continuous `gsap.to(rotation, {repeat:-1})` → `useRotate` |
| Waveform reacting to scroll velocity | `Observer` (velocity) |
| Smooth momentum scroll | `ScrollSmoother` (or Lenis) — evaluate next cycle |

New composables to add when we build sections: `useScramble`, `useClipReveal`,
`useCounter`, `useRotate`. Everything still routes through `registerGsap()` and
respects `prefers-reduced-motion` (see the GSAP law in `AGENTS.md`).

## Deltas to apply to our foundation

1. Retune semantic tokens: `--color-bg` → warm dark brown (`#1F1D18`-ish), add
   `--color-sand` / a light-section surface + its ink.
2. Remove/repurpose the `bg-sun` atmosphere; replace styleguide "Atmosphere"
   with cinematic-image + grain + glitch demos.
3. Register `ScrambleTextPlugin`; plan the 4 new composables above.
4. Add the two-family type system (serif display + tracked uppercase grotesque).
