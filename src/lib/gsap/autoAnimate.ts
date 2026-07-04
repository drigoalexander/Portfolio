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
