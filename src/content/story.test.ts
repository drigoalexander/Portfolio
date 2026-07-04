import { describe, it, expect } from "vitest";
import { chapters, site } from "./story";

describe("story content", () => {
  it("tells the full eight-chapter arc", () => {
    expect(chapters).toHaveLength(8);
    expect(chapters.map((c) => c.num)).toEqual([
      "00", "01", "02", "03", "04", "05", "06", "07",
    ]);
  });

  it("has unique, slug-like ids", () => {
    const ids = chapters.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z-]+$/);
  });

  it("opens intimate/dark and ends expansive/sand", () => {
    expect(chapters[0]?.tone).toBe("dark");
    expect(chapters.at(-1)?.tone).toBe("sand");
    // the ground never darkens again once it has lightened
    const firstSand = chapters.findIndex((c) => c.tone === "sand");
    expect(firstSand).toBeGreaterThan(0);
    for (const c of chapters.slice(firstSand)) expect(c.tone).toBe("sand");
  });

  it("every chapter has a title and eyebrow", () => {
    for (const c of chapters) {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.eyebrow.length).toBeGreaterThan(0);
    }
  });

  it("site identity is complete enough to render chrome", () => {
    expect(site.wordmark.length).toBeGreaterThan(0);
    expect(site.email).toContain("@");
    expect(site.socials.length).toBeGreaterThan(0);
  });
});
