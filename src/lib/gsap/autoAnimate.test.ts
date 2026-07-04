import { describe, it, expect } from "vitest";
import { parseAnimAttrs } from "./autoAnimate";

function el(attrs: Record<string, string>): Element {
  const e = { getAttribute: (k: string) => attrs[k] ?? null } as unknown as Element;
  return e;
}

describe("parseAnimAttrs", () => {
  it("returns null when data-anim is absent", () => {
    expect(parseAnimAttrs(el({}))).toBeNull();
  });

  it("parses a reveal with defaults", () => {
    const cfg = parseAnimAttrs(el({ "data-anim": "reveal" }));
    expect(cfg).toEqual({ kind: "reveal", delay: 0, duration: undefined, y: 24, from: 0 });
  });

  it("parses modifiers", () => {
    const cfg = parseAnimAttrs(
      el({ "data-anim": "parallax", "data-anim-delay": "0.2", "data-anim-y": "80" }),
    );
    expect(cfg?.kind).toBe("parallax");
    expect(cfg?.delay).toBe(0.2);
    expect(cfg?.y).toBe(80);
  });

  it("ignores unknown kinds", () => {
    expect(parseAnimAttrs(el({ "data-anim": "wobble" }))).toBeNull();
  });
});
