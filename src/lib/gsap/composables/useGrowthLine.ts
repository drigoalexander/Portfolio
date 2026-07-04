import { registerGsap, ScrollTrigger } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { toHandle, type AnimHandle, type Target } from "./types";

/**
 * The page spine: a thin SVG line that draws itself across the full scroll,
 * with a node lighting up as each chapter enters. Reduced motion: the line
 * is fully drawn and every node is lit.
 */
export function useGrowthLine(
  path: Target,
  opts: {
    /** element whose scroll range drives the draw (default: whole page) */
    trigger?: Element | string;
    /** chapter node elements; class `is-lit` is toggled on them */
    nodes?: string | Element[];
    scrub?: boolean | number;
  } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { trigger, nodes = "[data-growth-node]", scrub = 0.6 } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    const nodeEls = gsap.utils.toArray<Element>(nodes);

    if (reduce) {
      gsap.set(path, { drawSVG: "100%" });
      for (const node of nodeEls) node.classList.add("is-lit");
      return;
    }

    gsap.fromTo(
      path,
      { drawSVG: "0%" },
      {
        drawSVG: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: (trigger ?? document.body) as gsap.DOMTarget,
          start: "top top",
          end: "bottom bottom",
          scrub,
        },
      },
    );

    for (const node of nodeEls) {
      ScrollTrigger.create({
        trigger: node.closest("[data-chapter]") ?? node,
        start: "top 62%",
        onEnter: () => node.classList.add("is-lit"),
        onLeaveBack: () => node.classList.remove("is-lit"),
      });
    }
  });

  return toHandle(ctx);
}
