import { registerGsap, Flip } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { EASES } from "../eases";
import { toHandle, type AnimHandle, type Target } from "./types";

/** The layout snapshot produced by Flip.getState(). */
export type FlipState = ReturnType<typeof Flip.getState>;

/** Capture layout state BEFORE a DOM/class change. */
export function captureFlip(target: Target): FlipState {
  registerGsap();
  return Flip.getState(target as gsap.DOMTarget);
}

/** Animate FROM a captured state to the current layout. Call after the change. */
export function useFlip(
  state: FlipState,
  opts: { duration?: number } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { duration = 0.7 } = opts;

  const ctx = gsap.context(() => {
    Flip.from(state, {
      duration: prefersReducedMotion() ? 0 : duration,
      ease: EASES.hop,
      absolute: true,
    });
  });

  return toHandle(ctx);
}
