import { registerGsap } from "../register";
import { toHandle, type AnimHandle } from "./types";

/**
 * Scrubs `--day` from 0 (night) to 1 (the sand morning) on `targets` while
 * `trigger` scrolls in — the scene's pigments, the tree's ink and the paper
 * tooth all blend with it, so the day arrives under the reader's hand and
 * reverses with it, instead of flipping on a threshold and running a timer.
 * Color only, so it runs under reduced motion too.
 */
export function useDayScrub(
  targets: string | Element[],
  trigger: Element | string,
  opts: { start?: string; end?: string } = {},
): AnimHandle {
  const gsap = registerGsap();
  const { start = "top 95%", end = "top 30%" } = opts;

  const ctx = gsap.context(() => {
    gsap.fromTo(
      targets,
      { "--day": 0 },
      {
        "--day": 1,
        ease: "none",
        scrollTrigger: { trigger: trigger as gsap.DOMTarget, start, end, scrub: true },
      },
    );
  });

  return toHandle(ctx);
}
