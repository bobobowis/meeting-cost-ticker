import { describe, it, expect } from "vitest";
import {
  perSecondCost,
  costAfter,
  formatUSD,
  formatMoney,
  formatElapsed,
  DEFAULT_HOURS_PER_YEAR,
} from "./cost";

describe("perSecondCost", () => {
  it("computes per-second burn for one person at 2080 h/yr", () => {
    // $75,000 / 2080 / 3600 ≈ $0.010016 per second
    const rate = perSecondCost(1, 75000);
    expect(rate).toBeCloseTo(75000 / DEFAULT_HOURS_PER_YEAR / 3600, 10);
    expect(rate).toBeCloseTo(0.010016, 5);
  });

  it("scales linearly with headcount", () => {
    expect(perSecondCost(5, 80000)).toBeCloseTo(5 * perSecondCost(1, 80000), 10);
  });

  it("honors a custom hours-per-year", () => {
    expect(perSecondCost(1, 100000, 1000)).toBeCloseTo(100000 / 1000 / 3600, 10);
  });

  it("returns 0 for non-positive or non-finite inputs", () => {
    expect(perSecondCost(0, 80000)).toBe(0);
    expect(perSecondCost(5, 0)).toBe(0);
    expect(perSecondCost(-1, 80000)).toBe(0);
    expect(perSecondCost(5, 80000, 0)).toBe(0);
    expect(perSecondCost(NaN, 80000)).toBe(0);
    expect(perSecondCost(5, Infinity)).toBe(0);
  });
});

describe("costAfter", () => {
  it("multiplies elapsed seconds by the rate", () => {
    expect(costAfter(60, 0.01)).toBeCloseTo(0.6, 10);
  });
  it("clamps negative / non-finite elapsed to 0", () => {
    expect(costAfter(-5, 0.01)).toBe(0);
    expect(costAfter(NaN, 0.01)).toBe(0);
  });
});

describe("formatUSD", () => {
  it("formats with a $ sign and two decimals", () => {
    expect(formatUSD(1234.5)).toBe("$1,234.50");
    expect(formatUSD(0)).toBe("$0.00");
  });
  it("falls back to $0.00 for non-finite", () => {
    expect(formatUSD(NaN)).toBe("$0.00");
    expect(formatUSD(Infinity)).toBe("$0.00");
  });
});

describe("formatMoney", () => {
  it("defaults to USD / en-US", () => {
    expect(formatMoney(1234.5)).toBe("$1,234.50");
  });
  it("formats EUR in es-ES with comma decimals and euro sign", () => {
    const out = formatMoney(1234.5, "EUR", "es-ES");
    expect(out).toContain("€");
    expect(out).toContain(",50"); // decimal comma
    expect(out).not.toBe(formatMoney(1234.5, "USD", "en-US"));
  });
  it("falls back to 0.00 for non-finite", () => {
    expect(formatMoney(NaN, "EUR", "es-ES")).toContain("0,00");
  });
});

describe("formatElapsed", () => {
  it("shows MM:SS under an hour", () => {
    expect(formatElapsed(0)).toBe("00:00");
    expect(formatElapsed(65)).toBe("01:05");
    expect(formatElapsed(599)).toBe("09:59");
  });
  it("shows H:MM:SS at/over an hour", () => {
    expect(formatElapsed(3600)).toBe("1:00:00");
    expect(formatElapsed(3661)).toBe("1:01:01");
  });
  it("clamps and floors odd input", () => {
    expect(formatElapsed(-5)).toBe("00:00");
    expect(formatElapsed(1.9)).toBe("00:01");
  });
});
