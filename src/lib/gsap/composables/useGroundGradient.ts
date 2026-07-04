import { registerGsap } from "../register";
import { toHandle, type AnimHandle } from "./types";

export interface GroundStop {
  /** id of the section element this tone belongs to */
  id: string;
  /** CSS color the ground holds at this section's core */
  color: string;
}

/**
 * Pure: builds a vertical CSS gradient from section centers so every tone
 * blends into the next across the boundary between sections. `hold` is the
 * fraction of each section's height kept solid around its center — kept
 * small so most of each section is a long, imperceptible wash into the
 * next tone (hard-looking steps between chapters read as banding).
 */
export function buildGroundGradient(
  stops: Array<{ color: string; center: number; height: number }>,
  totalHeight: number,
  hold = 0.18,
): string {
  if (stops.length === 0) return "";
  const pct = (v: number) => `${((v / totalHeight) * 100).toFixed(2)}%`;
  const parts: string[] = [];
  for (const s of stops) {
    const half = (s.height * hold) / 2;
    parts.push(`${s.color} ${pct(s.center - half)}`, `${s.color} ${pct(s.center + half)}`);
  }
  return `linear-gradient(to bottom, ${parts.join(", ")})`;
}

/**
 * The sunrise ground: one document-height gradient over `container`, with a
 * stop measured at each section's real center — every color change between
 * sections is a smooth gradation by construction. Re-measures on resize.
 * Static (no motion), so it needs no reduced-motion branch; the inline
 * fallback gradient simply gets refined once JS runs.
 */
export function useGroundGradient(
  container: Element | string,
  stops: GroundStop[],
): AnimHandle {
  const gsap = registerGsap();

  const ctx = gsap.context(() => {
    if (typeof window === "undefined") return;
    const el =
      typeof container === "string" ? document.querySelector<HTMLElement>(container) : container;
    if (!(el instanceof HTMLElement)) return;

    const apply = () => {
      const base = el.getBoundingClientRect().top + window.scrollY;
      const measured = stops.flatMap((s) => {
        const sec = document.getElementById(s.id);
        if (!sec) return [];
        const r = sec.getBoundingClientRect();
        const top = r.top + window.scrollY - base;
        return [{ color: s.color, center: top + r.height / 2, height: r.height }];
      });
      const gradient = buildGroundGradient(measured, el.scrollHeight);
      if (gradient) el.style.backgroundImage = gradient;
    };

    apply();
    const ro = new ResizeObserver(() => apply());
    ro.observe(el);
    return () => ro.disconnect();
  });

  return toHandle(ctx);
}
