import { registerGsap, ScrollTrigger } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { EASES } from "../eases";
import { toHandle, type AnimHandle, type Target } from "./types";

/** sessionStorage flag: the bumper plays once per browsing session */
export const OPENING_SEEN_KEY = "drigo:cine-opening";

/** html class set by the pre-paint gate while the bumper owns the frame */
export const OPENING_CLASS = "cine-play";

/** The bumper is pure theater — skip it for reduced motion or a replay. */
export function shouldPlayOpening(reduce: boolean, seen: boolean): boolean {
  return !reduce && !seen;
}

/**
 * The bumper — a film-ident sting before the site: on a full-bleed dark
 * frame the logo mark inks itself on (DrawSVG outline), floods with gold,
 * holds like a studio card, then PANS up into the topbar and becomes the
 * site logo while the frame fades off the world. Scroll is locked while
 * it plays; on completion the `cine-play` class comes off the root (which
 * reveals the real topbar logo exactly under the landed mark) and the
 * overlay removes itself — the page beneath is always the source of truth.
 *
 * Overlay contract (see `CinematicOpening.astro`):
 * - `[data-cine-bg]`     — the full-bleed dark frame, faded independently
 * - `[data-cine-mark]`   — the logo svg (kept invisible until the tl owns it)
 * - `[data-cine-stroke]` — outline paths, drawn in document order
 * - `[data-cine-fill]`   — the solid mark, faded in over the ink
 * - `[data-site-logo]`   — OUTSIDE the overlay: the topbar logo the mark
 *                          flies to (hidden by `.cine-play` until landing)
 */
export function useCinematicOpening(overlay: Target): AnimHandle {
  const gsap = registerGsap();
  const reduce = prefersReducedMotion();
  let restoreScroll: (() => void) | null = null;

  const releaseFrame = () => {
    restoreScroll?.();
    document.documentElement.classList.remove(OPENING_CLASS);
  };

  const ctx = gsap.context(() => {
    if (typeof window === "undefined") return;
    const el =
      typeof overlay === "string"
        ? document.querySelector(overlay)
        : Array.isArray(overlay)
          ? overlay[0]
          : overlay;
    if (!(el instanceof HTMLElement)) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem(OPENING_SEEN_KEY) !== null;
    } catch {
      /* storage unavailable → treat as unseen */
    }
    if (!shouldPlayOpening(reduce, seen)) {
      document.documentElement.classList.remove(OPENING_CLASS);
      el.remove();
      return;
    }
    try {
      sessionStorage.setItem(OPENING_SEEN_KEY, "1");
    } catch {
      /* fine — it will just play again next load */
    }

    const bg = el.querySelector("[data-cine-bg]");
    const mark = el.querySelector("[data-cine-mark]");
    const strokes = Array.from(el.querySelectorAll("[data-cine-stroke]"));
    const fill = el.querySelector("[data-cine-fill]");
    const target = document.querySelector("[data-site-logo] svg");
    if (!mark || strokes.length === 0) {
      document.documentElement.classList.remove(OPENING_CLASS);
      el.remove();
      return;
    }

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    restoreScroll = () => {
      html.style.overflow = prevOverflow;
      restoreScroll = null;
    };

    // the pan: center-of-mark → center-of-topbar-logo, measured on exit so
    // late resizes can't strand the landing (opacity-hidden targets still
    // have layout, so the rect is real)
    const flight = (axis: "x" | "y" | "scale") => () => {
      if (!target) return axis === "scale" ? 0.2 : 0;
      const from = mark.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      if (axis === "scale") return to.height / from.height;
      if (axis === "x") return to.left + to.width / 2 - (from.left + from.width / 2);
      return to.top + to.height / 2 - (from.top + from.height / 2);
    };

    const tl = gsap.timeline({
      onComplete: () => {
        releaseFrame();
        el.remove();
        ScrollTrigger.refresh();
      },
    });

    tl.set(el, { autoAlpha: 1 }, 0)
      .set(mark, { autoAlpha: 1 }, 0)
      // the mark settles forward for the whole take — the camera breathing
      .fromTo(
        mark,
        { scale: 0.94, transformOrigin: "50% 50%" },
        { scale: 1, duration: 2.3, ease: EASES.glide },
        0,
      )
      // ink: the outline draws itself
      .fromTo(
        strokes,
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 1.2, stagger: 0.18, ease: EASES.sweep },
        0.1,
      )
      // pigment: the solid mark floods in beneath the ink
      .fromTo(fill, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: "power2.inOut" }, "-=0.45")
      .to(strokes, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, "-=0.35")
      // the studio-card hold
      .to({}, { duration: 0.6 })
      // the pan: the frame fades off the world while the mark flies to the
      // topbar and lands where the real logo waits
      .add("exit")
      .to(bg, { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" }, "exit+=0.1")
      .to(
        mark,
        {
          x: flight("x"),
          y: flight("y"),
          scale: flight("scale"),
          duration: 0.9,
          ease: EASES.sweep,
        },
        "exit",
      );

    // no topbar target (markup changed?) — degrade to a clean fade-out
    if (!target) tl.to(mark, { autoAlpha: 0, duration: 0.4, ease: "power1.in" }, "exit+=0.3");
  });

  const handle = toHandle(ctx);
  return {
    ctx,
    kill: () => {
      releaseFrame();
      handle.kill();
    },
  };
}
