import { registerGsap, Draggable } from "../register";
import { toHandle, type AnimHandle, type Target } from "./types";

export function useDraggable(
  target: Target,
  opts: { inertia?: boolean; bounds?: Element | string } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { inertia = true, bounds } = opts;

  const ctx = gsap.context(() => {
    Draggable.create(target as gsap.DOMTarget, {
      type: "x,y",
      inertia,
      bounds,
      edgeResistance: 0.75,
    });
  });

  return toHandle(ctx);
}
