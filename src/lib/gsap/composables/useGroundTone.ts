import { registerGsap, ScrollTrigger } from "../register";
import { toHandle, type AnimHandle } from "./types";

/**
 * Flips `data-ground` on <html> when `trigger` enters, so fixed chrome and
 * the tree artwork can restyle for the light ground. Works everywhere the
 * (mobile-hidden) ChapterIndicator doesn't. Runs under reduced motion too —
 * it's a contrast concern, not an animation.
 */
export function useGroundTone(
  trigger: Element | string,
  opts: { tone?: string; start?: string } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { tone = "sand", start = "top 60%" } = opts;

  const ctx = gsap.context(() => {
    if (typeof window === "undefined") return;
    const set = (value: string) => {
      document.documentElement.dataset.ground = value;
    };
    ScrollTrigger.create({
      trigger: trigger as gsap.DOMTarget,
      start,
      onEnter: () => set(tone),
      onLeaveBack: () => set("dark"),
    });
  });

  return toHandle(ctx);
}
