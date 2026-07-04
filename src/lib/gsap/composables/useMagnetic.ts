import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { EASES } from "../eases";
import { toHandle, type AnimHandle } from "./types";

export function useMagnetic(
  el: HTMLElement,
  opts: { strength?: number } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { strength = 0.4 } = opts;

  if (prefersReducedMotion()) {
    return toHandle(gsap.context(() => {}));
  }

  const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: EASES.glide });
  const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: EASES.glide });

  const move = (e: MouseEvent) => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - (r.left + r.width / 2)) * strength);
    yTo((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { xTo(0); yTo(0); };

  const ctx = gsap.context(() => {
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", reset);
  });

  return {
    ctx,
    kill: () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", reset);
      ctx.revert();
    },
  };
}
