import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { EASES } from "../eases";
import { toHandle, type AnimHandle, type Target } from "./types";

export function useDrawSVG(
  target: Target,
  opts: { duration?: number; start?: string } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { duration = 1.4, start = "top 85%" } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    if (reduce) {
      gsap.set(target, { drawSVG: "100%" });
      return;
    }
    gsap.from(target, {
      drawSVG: "0%", duration, ease: EASES.glide,
      scrollTrigger: { trigger: target as gsap.DOMTarget, start, once: true },
    });
  });

  return toHandle(ctx);
}
