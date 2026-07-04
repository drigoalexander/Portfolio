# Design Reference — Son Daven (sondaven.com/en)

**This folder is the primary visual/motion reference for the portfolio.** When
building UI or animation, look here first to match the target aesthetic and
motion language. Read [`design-notes.md`](./design-notes.md) for the extracted
palette, typography, layout and motion catalog.

Captured 2026-07-04 from `https://sondaven.com/en` with Playwright (Chromium,
desktop 1440×900 @2x).

## Why images, not video

Agents (Claude) **cannot read `.webm`/`.mp4`** — the Read tool only handles
images (PNG/JPG) and PDFs. So the agent-facing reference is **PNG frames**:

- `screens/` — full-page + representative section screenshots (post-reveal states).
- `motion/` — 12 evenly-spaced frames extracted from the scroll-through video,
  so the animation/section flow is captured as *readable images*.

The video itself is kept for **human** review only:

- `video/walkthrough-desktop.mp4` — compressed scroll-through (open in a player).

## Structure

```
sondaven/
  README.md              ← you are here
  design-notes.md        ← palette, type, layout, motion — READ THIS
  screens/
    desktop-full.png     ← whole page, stitched (best single overview)
    desktop-00-hero.png
    desktop-04..40-section.png   (representative sections)
  motion/
    frame-01..12.png     ← scroll-through keyframes (hero → FAQ)
  video/
    walkthrough-desktop.mp4      ← human-only
```

## Re-capturing

The capture + processing scripts live in the session scratchpad
(`capture.mjs`, `process.sh`). To refresh: install `playwright`, run
`bun run capture.mjs <out-dir>`, then `zsh process.sh`.
