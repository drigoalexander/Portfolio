import { describe, it, expect } from "vitest";
import gsap from "gsap";
import { EASES, registerEases } from "./eases";

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
});
