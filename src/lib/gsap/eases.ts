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
  /** critically damped spring — moves at once, settles without overshoot */
  settle: "settle",
} as const;

/**
 * Pure: the step response of a critically damped spring (Apple's damping
 * 1.0, `response` seconds), sampled over `duration` seconds as CustomEase
 * path data. It starts moving on the first frame and spends its time
 * settling, where `sweep` spends its first 15% almost still.
 */
export function settlePath(response = 1, duration = 1.3, samples = 40): string {
  const w = (2 * Math.PI) / response;
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * duration;
    const y = i === samples ? 1 : 1 - (1 + w * t) * Math.exp(-w * t);
    pts.push(`${(i / samples).toFixed(4)},${y.toFixed(4)}`);
  }
  return `M${pts[0]} L${pts.slice(1).join(" ")}`;
}

let registered = false;

export function registerEases(): void {
  if (registered) return;
  gsap.registerPlugin(CustomEase);
  CustomEase.create(EASES.hop, "M0,0 C0.14,1 0.4,1 1,1");
  CustomEase.create(EASES.sweep, "M0,0 C0.6,0 0.05,1 1,1");
  CustomEase.create(EASES.glide, "M0,0 C0.25,0.1 0.25,1 1,1");
  CustomEase.create(EASES.settle, settlePath());
  registered = true;
}
