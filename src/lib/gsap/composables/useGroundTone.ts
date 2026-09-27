import { registerGsap, ScrollTrigger } from "../register";
import { toHandle, type AnimHandle } from "./types";

/**
 * Flips `data-ground` on <html> when `trigger` enters, so fixed chrome and
 * the tree artwork can restyle for the light ground. Works everywhere the
 * (mobile-hidden) ChapterIndicator doesn't. Runs under reduced motion too —
 * it's a contrast concern, not an animation. `attr` names a different data
 * attribute, for chrome whose ground turns at another point of the screen.
 */
export function useGroundTone(
  trigger: Element | string,
  opts: { tone?: string; start?: string; attr?: string } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { tone = "sand", start = "top 60%", attr = "ground" } = opts;

  const ctx = gsap.context(() => {
    if (typeof window === "undefined") return;
    const set = (value: string) => {
      document.documentElement.dataset[attr] = value;
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
