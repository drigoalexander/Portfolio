import { describe, it, expect } from "vitest";
import { shouldPlayOpening, OPENING_SEEN_KEY } from "./useCinematicOpening";

describe("shouldPlayOpening", () => {
  it("plays when motion is allowed and it hasn't been seen", () => {
    expect(shouldPlayOpening(false, false)).toBe(true);
  });

  it("skips under prefers-reduced-motion", () => {
    expect(shouldPlayOpening(true, false)).toBe(false);
  });

  it("skips once seen this session", () => {
    expect(shouldPlayOpening(false, true)).toBe(false);
  });

  it("keeps a stable storage key (inline gate script depends on it)", () => {
    expect(OPENING_SEEN_KEY).toBe("drigo:cine-opening");
  });
});
