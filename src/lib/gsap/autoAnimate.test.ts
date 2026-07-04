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

  it("parses a scramble with a custom charset", () => {
    const cfg = parseAnimAttrs(
      el({ "data-anim": "scramble", "data-anim-chars": "▓▒░", "data-anim-duration": "2.4" }),
    );
    expect(cfg?.kind).toBe("scramble");
    expect(cfg?.chars).toBe("▓▒░");
    expect(cfg?.duration).toBe(2.4);
  });

  it("defaults chars to undefined when absent", () => {
    const cfg = parseAnimAttrs(el({ "data-anim": "scramble" }));
    expect(cfg?.chars).toBeUndefined();
  });

  it("parses a clip with a starting inset via data-anim-from", () => {
    const cfg = parseAnimAttrs(el({ "data-anim": "clip", "data-anim-from": "22" }));
    expect(cfg?.kind).toBe("clip");
    expect(cfg?.from).toBe(22);
  });

  it("parses a ScrollTrigger start override", () => {
    const cfg = parseAnimAttrs(el({ "data-anim": "reveal", "data-anim-start": "top 99%" }));
    expect(cfg?.start).toBe("top 99%");
    expect(parseAnimAttrs(el({ "data-anim": "reveal" }))?.start).toBeUndefined();
  });
});
