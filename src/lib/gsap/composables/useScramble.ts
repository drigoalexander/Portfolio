import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { toHandle, type AnimHandle, type Target } from "./types";

/** Charsets for the noise→clarity arc: rough for early chapters, crisp later. */
export const SCRAMBLE_CHARS = {
  rough: "▚▞▓▒░/\\<>#",
  crisp: "upperCase",
} as const;

/**
 * Scramble → resolve text on scroll enter (the "knowing yourself" device).
 * The element's real text stays in the DOM for SSR/SEO; the scramble only
 * runs client-side. Reduced motion: text is simply left in its final state.
 */
export function useScramble(
  target: Target,
  opts: {
    /** resolve text; defaults to the element's own text content */
    text?: string;
    chars?: string;
    duration?: number;
    delay?: number;
    revealDelay?: number;
    speed?: number;
    start?: string;
  } = {},
): AnimHandle {
  const gsap = registerGsap();
  const {
    text,
    chars = SCRAMBLE_CHARS.crisp,
    duration = 1.6,
    delay = 0,
    revealDelay = 0.3,
    speed = 0.4,
    start = "top 85%",
  } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    if (reduce) return; // SSR text is already the final, legible state

    for (const el of gsap.utils.toArray<Element>(target)) {
      const resolved = text ?? el.textContent?.trim() ?? "";
      if (!resolved) continue;
      // keep assistive tech on the real words while glyphs churn
      el.setAttribute("aria-label", resolved);
      // churned glyphs form unbreakable runs — keep them wrapping
      if (el instanceof HTMLElement) el.style.overflowWrap = "anywhere";
      gsap.to(el, {
        duration,
        delay,
        ease: "none",
        scrambleText: { text: resolved, chars, revealDelay, speed, tweenLength: false },
        scrollTrigger: { trigger: el, start, once: true },
      });
    }
  });

  return toHandle(ctx);
}
