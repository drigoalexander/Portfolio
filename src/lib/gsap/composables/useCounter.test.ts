import { describe, it, expect } from "vitest";
import { formatStat } from "./useCounter";

describe("formatStat", () => {
  it("rounds and localizes", () => {
    expect(formatStat(1234.56)).toBe("1,235");
  });

  it("applies prefix and suffix", () => {
    expect(formatStat(3, { suffix: "M+" })).toBe("3M+");
    expect(formatStat(24, { prefix: "~", suffix: "+" })).toBe("~24+");
  });

  it("holds stable at integer endpoints", () => {
    expect(formatStat(0)).toBe("0");
    expect(formatStat(12, {})).toBe("12");
  });
});
