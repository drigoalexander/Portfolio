import { describe, it, expect } from "vitest";
import { inkOutline, parsePath } from "./ink";

/** x/y pairs of an outline, arc command dropped */
const points = (d: string) => {
  const nums = d.replace(/A[^A-Z]*?(?=Z)/g, "").match(/-?\d*\.?\d+/g)!.map(Number);
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < nums.length; i += 2) pts.push([nums[i]!, nums[i + 1]!]);
  return pts;
};

describe("parsePath", () => {
  it("resolves relative curves and lines to absolute cubics", () => {
    const [smoke] = parsePath("M 305 938 c 6 -10 -4 -16 4 -26");
    expect(smoke).toHaveLength(1);
    expect(smoke![0]![0]).toEqual([305, 938]);
    expect(smoke![0]![3]).toEqual([309, 912]);

    const [chimney] = parsePath("M 296 968 l -1 -20 l 14 -1 l 1 14");
    expect(chimney).toHaveLength(3);
    expect(chimney!.at(-1)![3]).toEqual([310, 961]);
  });

  it("closes a subpath with a line back to its start", () => {
    const [win] = parsePath("M 288 1024 h 15 v 15 h -15 z");
    expect(win).toHaveLength(4);
    expect(win!.at(-1)![3]).toEqual([288, 1024]);
  });

  it("refuses commands the artwork doesn't use", () => {
    expect(() => parsePath("M 0 0 Q 5 5 10 0")).toThrow(/unsupported/);
  });
});

describe("inkOutline", () => {
  it("stays within the pen's reach of the stroke", () => {
    const d = inkOutline("M 0 0 L 100 0", 4, "pen", 1);
    expect(d.startsWith("M")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    for (const [x, y] of points(d)) {
      expect(Math.abs(y)).toBeLessThanOrEqual(2 * 1.15 + 0.1);
      expect(x).toBeGreaterThanOrEqual(-0.1);
      expect(x).toBeLessThanOrEqual(100.1);
    }
  });

  it("tapers a grass blade from root to tip", () => {
    const pts = points(inkOutline("M 0 0 C 0 -10 0 -20 0 -30", 2, "grass"));
    const root = Math.abs(pts[0]![0]);
    const tip = pts.filter(([, y]) => y < -29.9).map(([x]) => Math.abs(x));
    expect(root).toBeGreaterThan(1);
    expect(Math.max(...tip)).toBeLessThan(0.2);
  });
});
