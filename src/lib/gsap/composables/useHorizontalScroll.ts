import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { toHandle, type AnimHandle } from "./types";

/** Pins `container` and scrolls `track` horizontally on vertical scroll. */
export function useHorizontalScroll(
  container: HTMLElement,
  track: HTMLElement,
): AnimHandle {
  const gsap = registerGsap();

  const ctx = gsap.context(() => {
    if (prefersReducedMotion()) return;
    const distance = () => track.scrollWidth - container.offsetWidth;
    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 1,
        end: () => "+=" + distance(),
        invalidateOnRefresh: true,
      },
    });
  }, container);

  return toHandle(ctx);
}
