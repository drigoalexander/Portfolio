import { registerGsap, SplitText } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { EASES } from "../eases";
import { toHandle, type AnimHandle, type Target } from "./types";

export function useSplitReveal(
  target: Target,
  opts: { stagger?: number; start?: string; type?: string } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { stagger = 0.03, start = "top 85%", type = "lines,words" } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    if (reduce) {
      gsap.set(target, { opacity: 1 });
      return;
    }
    const split = new SplitText(target as gsap.DOMTarget, { type, linesClass: "sr-line" });
    gsap.from(split.words, {
      opacity: 0, yPercent: 120, stagger, duration: 0.8, ease: EASES.hop,
      scrollTrigger: { trigger: target as gsap.DOMTarget, start, once: true },
    });
  });

  return toHandle(ctx);
}
