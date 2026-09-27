import { describe, it, expect } from "vitest";
import gsap from "gsap";
import { EASES, registerEases, settlePath } from "./eases";

describe("signature eases", () => {
  it("registers named eases that behave as easing functions", () => {
    registerEases();
    for (const name of Object.values(EASES)) {
      const ease = gsap.parseEase(name);
      expect(typeof ease).toBe("function");
      expect(ease(0)).toBeCloseTo(0, 5);
      expect(ease(1)).toBeCloseTo(1, 5);
    }
  });

  it("is idempotent (double registration does not throw)", () => {
    expect(() => {
      registerEases();
      registerEases();
    }).not.toThrow();
  });

  it("settle moves on the first frame and never overshoots", () => {
    registerEases();
    const ease = gsap.parseEase(EASES.settle);
    const sweep = gsap.parseEase(EASES.sweep);
    // at 200ms of a 1.3s tween the headline is well under way, unlike sweep
    expect(ease(0.2 / 1.3)).toBeGreaterThan(0.3);
    expect(sweep(0.2 / 1.3)).toBeLessThan(0.1);
    let prev = 0;
    for (let x = 0; x <= 1.0001; x += 0.01) {
      const y = ease(Math.min(x, 1));
      expect(y).toBeGreaterThanOrEqual(prev - 1e-6);
      expect(y).toBeLessThanOrEqual(1 + 1e-6);
      prev = y;
    }
    expect(settlePath().startsWith("M0.0000,0.0000 L")).toBe(true);
  });
});
