import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { toHandle, type AnimHandle, type Target } from "./types";

/**
 * Scroll-scrubbed "opening" reveal — the frame un-crops as it enters
 * (the tight → expansive growth device). Reduced motion: fully open.
 */
export function useClipReveal(
  target: Target,
  opts: {
    /** starting crop, percent inset on every edge */
    inset?: number;
    /** starting scale of the frame itself */
    scale?: number;
    start?: string;
    end?: string;
    scrub?: boolean | number;
  } = {},
): AnimHandle {
  const gsap = registerGsap();
  const {
    inset = 14,
    scale = 0.96,
    start = "top 92%",
    end = "top 38%",
    scrub = true,
  } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    if (reduce) {
      gsap.set(target, { clipPath: "none", scale: 1 });
      return;
    }
    gsap.fromTo(
      target,
      { clipPath: `inset(${inset}% ${inset}%)`, scale },
      {
        clipPath: "inset(0% 0%)",
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: target as gsap.DOMTarget, start, end, scrub },
      },
    );
  });

  return toHandle(ctx);
}
