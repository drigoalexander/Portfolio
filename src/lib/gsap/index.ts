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
export { useScramble, SCRAMBLE_CHARS } from "./composables/useScramble";
export { useClipReveal } from "./composables/useClipReveal";
export { useCounter, formatStat } from "./composables/useCounter";
export { useGrowthLine } from "./composables/useGrowthLine";
export { useRotate } from "./composables/useRotate";
export { useGroundShift } from "./composables/useGroundShift";
export { useGroundGradient, buildGroundGradient } from "./composables/useGroundGradient";
export { useGroundTone } from "./composables/useGroundTone";
export { useTreeGrowth } from "./composables/useTreeGrowth";
export { useScrollProgress } from "./composables/useScrollProgress";
export {
  useCinematicOpening,
  shouldPlayOpening,
  OPENING_SEEN_KEY,
} from "./composables/useCinematicOpening";

/** Client entry: register GSAP and wire declarative [data-anim] content. */
export function initGsap(): void {
  if (typeof window === "undefined") return;
  registerGsap();
  autoAnimate(document);
}
