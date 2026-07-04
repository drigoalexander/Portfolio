import { registerGsap, ScrollTrigger } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { toHandle, type AnimHandle } from "./types";

/**
 * Reports overall page scroll progress (0–1) to `onProgress`. Reduced
 * motion: fires once with 0 and never again, so consumers render a static
 * initial state.
 */
export function useScrollProgress(onProgress: (p: number) => void): AnimHandle {
  const gsap = registerGsap();
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    if (typeof window === "undefined") return;
    if (reduce) {
      onProgress(0);
      return;
    }
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => onProgress(self.progress),
    });
    onProgress(0);
  });

  return toHandle(ctx);
}
