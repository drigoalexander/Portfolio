import { describe, it, expect } from "vitest";
import { createSpring } from "./spring";

const run = (damping: number) => {
  const s = createSpring(0.5, damping);
  s.target = 1;
  let peak = 0;
  for (let t = 0; t < 2; t += 1 / 60) {
    s.step(1 / 60);
    peak = Math.max(peak, s.x);
  }
  return { s, peak };
};

describe("createSpring", () => {
  it("settles on its target without overshoot when critically damped", () => {
    const { s, peak } = run(1);
    expect(peak).toBeLessThanOrEqual(1 + 1e-6);
    expect(s.idle()).toBe(true);
  });

  it("overshoots when under-damped, as a flicked thing should", () => {
    expect(run(0.3).peak).toBeGreaterThan(1.2);
  });
});
