import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { toHandle, type AnimHandle, type Target } from "./types";

/**
 * Scrubs the page ground from its current color to a token value while the
 * trigger section scrolls through — "the ground literally lightens as growth
 * happens". Sections past the shift carry their own static background, so
 * with reduced motion (or no JS) the layout is already in its final state
 * and this becomes a no-op.
 */
export function useGroundShift(
  target: Target,
  opts: {
    trigger: Element | string;
    /** CSS custom property holding the destination color */
    toVar?: string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
  },
): AnimHandle {
  const gsap = registerGsap();
  const {
    trigger,
    toVar = "--color-sand",
    start = "top 45%",
    end = "bottom 90%",
    scrub = true,
  } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    if (reduce || typeof window === "undefined") return;
    const to = getComputedStyle(document.documentElement).getPropertyValue(toVar).trim();
    if (!to) return;
    gsap.to(target, {
      backgroundColor: to,
      ease: "none",
      scrollTrigger: { trigger: trigger as gsap.DOMTarget, start, end, scrub },
    });
  });

  return toHandle(ctx);
}
