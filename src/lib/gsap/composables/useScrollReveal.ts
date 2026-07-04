import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { EASES } from "../eases";
import { toHandle, type AnimHandle, type Target } from "./types";

export function useScrollReveal(
  target: Target,
  opts: { y?: number; stagger?: number; start?: string; duration?: number } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { y = 28, stagger = 0.08, start = "top 85%", duration = 0.9 } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    if (reduce) {
      gsap.set(target, { opacity: 1, y: 0 });
      return;
    }
    gsap.from(target, {
      opacity: 0, y, duration, stagger, ease: EASES.sweep,
      scrollTrigger: { trigger: target as gsap.DOMTarget, start, once: true },
    });
  });

  return toHandle(ctx);
}
