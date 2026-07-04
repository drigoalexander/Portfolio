import { describe, it, expect } from "vitest";
import { buildGroundGradient } from "./useGroundGradient";

describe("buildGroundGradient", () => {
  it("returns an empty string with no stops", () => {
    expect(buildGroundGradient([], 1000)).toBe("");
  });

  it("holds each color around its section center, then blends", () => {
    const g = buildGroundGradient(
      [
        { color: "#111", center: 500, height: 1000 },
        { color: "#222", center: 1500, height: 1000 },
      ],
      2000,
      0.4,
    );
    // hold band = 40% of 1000px = 400px, i.e. ±200px around each center
    expect(g).toBe(
      "linear-gradient(to bottom, #111 15.00%, #111 35.00%, #222 65.00%, #222 85.00%)",
    );
  });

  it("keeps stops ordered for uneven section heights", () => {
    const g = buildGroundGradient(
      [
        { color: "a", center: 400, height: 800 },
        { color: "b", center: 1300, height: 1000 },
        { color: "c", center: 2200, height: 800 },
      ],
      2600,
    );
    const pcts = [...g.matchAll(/([\d.]+)%/g)].map((m) => Number(m[1]));
    expect(pcts).toEqual([...pcts].sort((x, y) => x - y));
    expect(g.startsWith("linear-gradient(to bottom, a ")).toBe(true);
  });
});
