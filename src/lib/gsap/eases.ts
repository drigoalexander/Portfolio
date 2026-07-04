import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

/** Named signature eases — the single source of truth for motion feel. */
export const EASES = {
  /** decisive entrance, slight overshoot-free settle */
  hop: "hop",
  /** long cinematic sweep for hero + section reveals */
  sweep: "sweep",
  /** soft glide for micro-interactions */
  glide: "glide",
} as const;

let registered = false;

export function registerEases(): void {
  if (registered) return;
  gsap.registerPlugin(CustomEase);
  CustomEase.create(EASES.hop, "M0,0 C0.14,1 0.4,1 1,1");
  CustomEase.create(EASES.sweep, "M0,0 C0.6,0 0.05,1 1,1");
  CustomEase.create(EASES.glide, "M0,0 C0.25,0.1 0.25,1 1,1");
  registered = true;
}
