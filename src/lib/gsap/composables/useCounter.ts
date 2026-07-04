import { registerGsap } from "../register";
import { prefersReducedMotion } from "../reduced-motion";
import { EASES } from "../eases";
import { toHandle, type AnimHandle, type Target } from "./types";

/** Pure formatter so counters render identically on server and client. */
export function formatStat(
  value: number,
  opts: { prefix?: string; suffix?: string } = {},
): string {
  const { prefix = "", suffix = "" } = opts;
  return `${prefix}${Math.round(value).toLocaleString("en-US")}${suffix}`;
}

/**
 * Counts a number up on scroll enter. The final value is server-rendered;
 * the count is a client enhancement. Reduced motion: final value, no count.
 */
export function useCounter(
  target: Target,
  opts: {
    to: number;
    from?: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    start?: string;
  },
): AnimHandle {
  const gsap = registerGsap();
  const { to, from = 0, duration = 1.8, prefix, suffix, start = "top 85%" } = opts;
  const reduce = prefersReducedMotion();

  const ctx = gsap.context(() => {
    const els = gsap.utils.toArray<Element>(target);
    const final = formatStat(to, { prefix, suffix });

    if (reduce) {
      for (const el of els) el.textContent = final;
      return;
    }
    for (const el of els) {
      // SSR renders the final value; rewind to `from` so the count is earned
      el.textContent = formatStat(from, { prefix, suffix });
      const state = { value: from };
      gsap.to(state, {
        value: to,
        duration,
        ease: EASES.glide,
        onUpdate: () => {
          el.textContent = formatStat(state.value, { prefix, suffix });
        },
        onComplete: () => {
          el.textContent = final;
        },
        scrollTrigger: { trigger: el, start, once: true },
      });
    }
  });

  return toHandle(ctx);
}
