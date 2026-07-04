import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { toHandle, type AnimHandle, type Target } from "./types";

/**
 * Continuous slow rotation for circular badges. Reduced motion: static.
 */
export function useRotate(
  target: Target,
  opts: { duration?: number; clockwise?: boolean } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { duration = 16, clockwise = true } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    if (reduce) return;
    gsap.to(target, {
      rotation: clockwise ? 360 : -360,
      duration,
      ease: "none",
      repeat: -1,
      transformOrigin: "50% 50%",
    });
  });

  return toHandle(ctx);
}
