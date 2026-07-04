import { describe, it, expect } from "vitest";
import { washReveal } from "./useTreeGrowth";

describe("washReveal", () => {
  it("rise grows up from the base", () => {
    const { from, to } = washReveal("rise");
    expect(from.scaleY).toBe(0.25);
    expect(from.transformOrigin).toBe("50% 100%");
    expect(to.scaleY).toBe(1);
    expect(to.autoAlpha).toBe(1);
  });

  it("bloom spreads from the heart", () => {
    const { from, to } = washReveal("bloom");
    expect(from.scale).toBe(0.55);
    expect(to.scale).toBe(1);
  });

  it("unknown or empty modes fall back to bloom", () => {
    expect(washReveal("")).toEqual(washReveal("bloom"));
    expect(washReveal(null)).toEqual(washReveal("bloom"));
    expect(washReveal("wobble")).toEqual(washReveal("bloom"));
  });
});
