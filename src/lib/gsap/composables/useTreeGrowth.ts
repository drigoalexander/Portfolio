import { registerGsap, ScrollTrigger } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { EASES } from "../eases";
import { toHandle, type AnimHandle, type Target } from "./types";

const DRAWABLE = "path, line, polyline, circle, ellipse";

/** Stroke length → timeline share, so long strokes take longer to draw. */
function drawTime(el: Element): number {
  const geo = el as SVGGeometryElement;
  const len = typeof geo.getTotalLength === "function" ? geo.getTotalLength() : 0;
  return Math.min(Math.max(len / 260, 0.35), 2.2);
}

/**
 * How a watercolor wash arrives. `rise` grows up from its base (trunk
 * segments); `bloom` spreads from its heart (canopy masses, glow) — pigment
 * blooming into wet paper. Unknown modes fall back to `bloom`.
 */
export function washReveal(mode: string | null): { from: gsap.TweenVars; to: gsap.TweenVars } {
  if (mode === "rise") {
    return {
      from: { autoAlpha: 0, scaleY: 0.25, transformOrigin: "50% 100%" },
      to: { autoAlpha: 1, scaleY: 1, duration: 0.9 },
    };
  }
  return {
    from: { autoAlpha: 0, scale: 0.55, transformOrigin: "50% 80%" },
    to: { autoAlpha: 1, scale: 1, duration: 0.7 },
  };
}

/**
 * A stage's animatable items in document order: strokes, plus pop/wash
 * elements or *groups* (whose children are handled as one unit).
 */
function stageItems(group: Element): Element[] {
  return Array.from(
    group.querySelectorAll(`[data-tree-pop], [data-tree-wash], ${DRAWABLE}`),
  ).filter((el) => {
    const unitRoot = el.closest("[data-tree-pop], [data-tree-wash]");
    return !unitRoot || unitRoot === el;
  });
}

/** Queues every item in `group` onto `tl`: strokes draw, pops fade/scale in,
 *  washes bloom in. */
function queueStage(tl: gsap.core.Timeline, group: Element): void {
  for (const el of stageItems(group)) {
    if (el.hasAttribute("data-tree-pop")) {
      tl.fromTo(
        el,
        { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 50%" },
        { autoAlpha: 1, scale: 1, duration: 0.45 },
        "-=0.28",
      );
    } else if (el.hasAttribute("data-tree-wash")) {
      const { from, to } = washReveal(el.getAttribute("data-tree-wash"));
      tl.fromTo(el, from, to, "-=0.35");
    } else {
      tl.fromTo(el, { drawSVG: "0%" }, { drawSVG: "100%", duration: drawTime(el) }, "-=0.25");
    }
  }
}

/**
 * The Tree of Growth — the page's main character. The SVG ships fully drawn
 * at the final wide shot (no-JS / reduced-motion fallback = the finished
 * artwork); with motion, a scroll camera starts tight on the seed and every
 * chapter draws its stage while the camera reframes, scrubbed to that
 * chapter's scroll range. Scrolling back rewinds time.
 *
 * - `data-tree-stage="<sectionId>"` — group drawn while `#<sectionId>` scrolls by
 * - `data-tree-stage-onload` — group draws once on page load (the hero seed)
 * - `data-tree-cam="x y w h"` — viewBox the camera settles on for that stage
 *   (on the onload group it becomes the initial frame)
 * - `data-tree-pop` — element/group pops in (fade/scale) instead of drawing;
 *   put authored transforms on a parent so the pop's scale doesn't clobber them
 * - `data-tree-sway` — group breathes with a slow perpetual sway
 * - `data-tree-parallax="<n>"` — depth plane: drifts from -n to +n art units
 *   vertically across the full scroll (negative n = foreground, moves opposite)
 */
export function useTreeGrowth(svg: Target): AnimHandle {
  const gsap = registerGsap();
  const reduce = prefersReducedMotion();
  let removeRefreshListener: (() => void) | null = null;

  const ctx = gsap.context(() => {
    if (typeof window === "undefined" || reduce) return;
    const root =
      typeof svg === "string" ? document.querySelector(svg) : Array.isArray(svg) ? svg[0] : svg;
    if (!(root instanceof SVGSVGElement)) return;

    const initialCam =
      root
        .querySelector("[data-tree-stage-onload][data-tree-cam]")
        ?.getAttribute("data-tree-cam") ?? root.getAttribute("viewBox");
    if (initialCam) root.setAttribute("viewBox", initialCam);

    const camStops: Array<{ section: HTMLElement; cam: string }> = [];

    for (const group of Array.from(root.querySelectorAll("[data-tree-stage]"))) {
      const stage = group.getAttribute("data-tree-stage");
      const section = stage ? document.getElementById(stage) : null;
      if (!section) continue;

      // each stage draws its own disjoint elements, so independent scrubbed
      // timelines are safe here (unlike the shared-viewBox camera below).
      // the draw starts a beat after the caption's entrance — text leads,
      // the tree answers
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top 62%", end: "top 8%", scrub: 0.8 },
      });
      queueStage(tl, group);

      const cam = group.getAttribute("data-tree-cam");
      if (cam) camStops.push({ section, cam });
    }

    // THE CAMERA — one timeline scrubbed across the whole document, with an
    // explicit from→to keyframe per stage at its measured scroll position.
    // (Independent per-stage tweens on the shared viewBox would lock start
    // values in scroll order and scramble on jumps/deep links.)
    let camTl: gsap.core.Timeline | null = null;
    const buildCamera = () => {
      camTl?.scrollTrigger?.kill();
      camTl?.kill();
      camTl = null;
      if (camStops.length === 0 || !initialCam) return;
      const vh = window.innerHeight;
      const total = document.documentElement.scrollHeight - vh;
      if (total <= 0) return;

      camTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.8 },
      });
      let prev = initialCam;
      let cursor = 0;
      for (const { section, cam } of camStops) {
        const top = section.getBoundingClientRect().top + window.scrollY;
        const from = Math.max((top - vh * 0.85) / total, cursor);
        const to = Math.max((top - vh * 0.25) / total, from + 0.001);
        camTl.fromTo(
          root,
          { attr: { viewBox: prev } },
          { attr: { viewBox: cam }, duration: to - from, immediateRender: false },
          from,
        );
        prev = cam;
        cursor = to;
      }
      camTl.set({}, {}, 1); // pin the timeline's length to the full scroll range
    };

    let rebuilding = false;
    const onRefresh = () => {
      if (rebuilding) return;
      rebuilding = true;
      buildCamera();
      rebuilding = false;
    };
    buildCamera();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    removeRefreshListener = () => ScrollTrigger.removeEventListener("refresh", onRefresh);

    for (const group of Array.from(root.querySelectorAll("[data-tree-stage-onload]"))) {
      const tl = gsap.timeline({ defaults: { ease: EASES.glide }, delay: 0.4 });
      queueStage(tl, group);
      tl.timeScale(1.8); // the seed lands while the name is still settling
    }

    // depth planes: each drifts at its own rate while the camera moves —
    // motion parallax is what sells the scene as a space, not a drawing
    for (const layer of Array.from(root.querySelectorAll("[data-tree-parallax]"))) {
      const drift = Number(layer.getAttribute("data-tree-parallax"));
      if (!Number.isFinite(drift) || drift === 0) continue;
      gsap.fromTo(
        layer,
        { y: -drift },
        {
          y: drift,
          ease: "none",
          scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.8 },
        },
      );
    }

    // the perpetual sway repaints the whole canopy every frame (SVG inner
    // transforms aren't compositor-accelerated on iOS Safari), so touch
    // devices keep the crown still and spend the frames on scrolling
    if (!window.matchMedia("(pointer: coarse)").matches) {
      for (const group of Array.from(root.querySelectorAll("[data-tree-sway]"))) {
        gsap.fromTo(
          group,
          { rotation: -0.9, transformOrigin: "50% 88%" },
          { rotation: 0.9, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 },
        );
      }
    }
  });

  const handle = toHandle(ctx);
  return {
    ctx,
    kill: () => {
      removeRefreshListener?.();
      handle.kill();
    },
  };
}
