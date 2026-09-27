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
 * elements or *groups* (whose children are handled as one unit). Pen ink
 * (`<Ink>`) draws through its mask path (`data-ink-draw`), so the ink
 * outline itself is never an item.
 */
function stageItems(group: Element): Element[] {
  return Array.from(
    group.querySelectorAll(`[data-tree-pop], [data-tree-wash], ${DRAWABLE}`),
  ).filter((el) => {
    if (el.hasAttribute("data-ink")) return false;
    const unitRoot = el.closest("[data-tree-pop], [data-tree-wash]");
    return !unitRoot || unitRoot === el;
  });
}

const center = (el: Element): [number, number] => {
  const r = el.getBoundingClientRect();
  return [r.x + r.width / 2, r.y + r.height / 2];
};

/** where the stage's first stroke starts, in screen space */
function stageOrigin(strokes: Element[]): [number, number] | null {
  const first = strokes.find((el) => typeof (el as SVGGeometryElement).getTotalLength === "function");
  if (!first) return null;
  const geo = first as SVGGeometryElement;
  const m = geo.getScreenCTM();
  if (!m) return center(first);
  const p = geo.getPointAtLength(0);
  return [m.a * p.x + m.c * p.y + m.e, m.b * p.x + m.d * p.y + m.f];
}

/**
 * A pen stroke's mask only exists while it draws: before, the ink is simply
 * hidden; after, it's plain ink. Masks re-rasterize on every camera frame,
 * so keeping ~30 of them live would tax the whole scroll.
 */
function inkSync(drawPath: Element): (() => void) | undefined {
  const ink = drawPath.parentElement?.nextElementSibling as SVGElement | null;
  const mask = ink?.getAttribute("mask");
  if (!ink || !mask) return undefined;
  let state = -1;
  const apply = (next: number) => {
    if (next === state) return;
    state = next;
    ink.style.visibility = next === 0 ? "hidden" : "";
    if (next === 1) ink.setAttribute("mask", mask);
    else ink.removeAttribute("mask");
  };
  apply(0); // undrawn until its stage says otherwise
  return function (this: gsap.core.Tween) {
    const p = this.progress();
    apply(p <= 0 ? 0 : p >= 1 ? 2 : 1);
  };
}

/** Queues every item in `group` onto `tl`: strokes draw, washes bloom in,
 *  then the pops — leaves unfurl from their stems and apples swell from
 *  theirs, in order of distance from the first stroke, so the foliage
 *  follows the growing tip outward. */
function queueStage(tl: gsap.core.Timeline, group: Element): void {
  const items = stageItems(group);
  const strokes = items.filter((el) => !el.hasAttribute("data-tree-pop"));
  let pops = items.filter((el) => el.hasAttribute("data-tree-pop"));
  const origin = stageOrigin(strokes);
  if (origin) {
    const dist = new Map(pops.map((el) => {
      const [x, y] = center(el);
      return [el, Math.hypot(x - origin[0], y - origin[1])];
    }));
    pops = pops.sort((a, b) => dist.get(a)! - dist.get(b)!);
  }

  for (const el of strokes) {
    if (el.hasAttribute("data-tree-wash")) {
      const { from, to } = washReveal(el.getAttribute("data-tree-wash"));
      tl.fromTo(el, from, to, "-=0.35");
    } else {
      tl.fromTo(
        el,
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: drawTime(el), onUpdate: inkSync(el) },
        "-=0.25",
      );
    }
  }
  pops.forEach((el, i) => {
    const holder = el.parentElement;
    if (holder?.hasAttribute("data-leaf")) {
      // folded along the branch, it opens about the stem (its local 0,0)
      tl.fromTo(
        el,
        { autoAlpha: 0, scale: 0, rotation: i % 2 ? 38 : -38, svgOrigin: "0 0" },
        { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.45, ease: "power2.out" },
        "-=0.28",
      );
    } else if (holder?.hasAttribute("data-apple")) {
      tl.fromTo(
        el,
        { autoAlpha: 0, scale: 0, svgOrigin: "0 -14" },
        { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power2.out" },
        "-=0.28",
      );
    } else {
      tl.fromTo(
        el,
        { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 50%" },
        { autoAlpha: 1, scale: 1, duration: 0.45 },
        "-=0.28",
      );
    }
  });
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
 *   put authored transforms on a parent so the pop's scale doesn't clobber them.
 *   Under a `data-leaf` parent it unfurls from the stem; under `data-apple` it
 *   swells from the stem
 * - `data-tree-parallax="<n>"` — depth plane: drifts from -n to +n art units
 *   vertically across the full scroll (negative n = foreground, moves opposite)
 *
 * `svg` is the tree's own svg; every svg beside it (the blurred depth planes)
 * shares the camera.
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
    const scene = root.parentElement ?? root;
    const planes = Array.from(scene.querySelectorAll("svg"));

    const initialCam =
      root
        .querySelector("[data-tree-stage-onload][data-tree-cam]")
        ?.getAttribute("data-tree-cam") ?? root.getAttribute("viewBox");
    if (initialCam) planes.forEach((p) => p.setAttribute("viewBox", initialCam));

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
        // each move eases out of one composed frame and into the next, like a
        // dolly — a linear segment would start and stop the camera dead
        const from = Math.max((top - vh * 0.95) / total, cursor);
        const to = Math.max((top - vh * 0.15) / total, from + 0.001);
        camTl.fromTo(
          planes,
          { attr: { viewBox: prev } },
          { attr: { viewBox: cam }, duration: to - from, ease: "sine.inOut", immediateRender: false },
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
    for (const layer of Array.from(scene.querySelectorAll("[data-tree-parallax]"))) {
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
