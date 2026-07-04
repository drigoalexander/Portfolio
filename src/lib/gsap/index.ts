import { registerGsap } from "./register";
import { autoAnimate } from "./autoAnimate";

export { registerGsap } from "./register";
export { EASES } from "./eases";
export { prefersReducedMotion } from "./reduced-motion";
export { autoAnimate, parseAnimAttrs } from "./autoAnimate";
export * from "./composables/types";
export { useScrollReveal } from "./composables/useScrollReveal";
export { useSplitReveal } from "./composables/useSplitReveal";
export { useParallax } from "./composables/useParallax";
export { useMagnetic } from "./composables/useMagnetic";
export { useHorizontalScroll } from "./composables/useHorizontalScroll";
export { useDraggable } from "./composables/useDraggable";
export { useDrawSVG } from "./composables/useDrawSVG";
export { captureFlip, useFlip } from "./composables/useFlip";

/** Client entry: register GSAP and wire declarative [data-anim] content. */
export function initGsap(): void {
  if (typeof window === "undefined") return;
  registerGsap();
  autoAnimate(document);
}
