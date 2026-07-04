import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { toHandle, type AnimHandle, type Target } from "./types";

export function useParallax(
  target: Target,
  opts: { amount?: number } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { amount = 20 } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    if (reduce) return;
    gsap.to(target, {
      yPercent: -amount, ease: "none",
      scrollTrigger: {
        trigger: target as gsap.DOMTarget,
        start: "top bottom", end: "bottom top", scrub: true,
      },
    });
  });

  return toHandle(ctx);
}
