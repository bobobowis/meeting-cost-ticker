import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { track } from "./analytics";

describe("track", () => {
  beforeEach(() => {
    delete (globalThis as Record<string, unknown>).plausible;
    delete (globalThis as Record<string, unknown>).umami;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("routes events to plausible when present", () => {
    const spy = vi.fn();
    (globalThis as Record<string, unknown>).plausible = spy;
    track("signup", { plan: "free" });
    expect(spy).toHaveBeenCalledWith("signup", { props: { plan: "free" } });
  });

  it("routes events to umami when present", () => {
    const spy = vi.fn();
    (globalThis as Record<string, unknown>).umami = { track: spy };
    track("signup", { plan: "free" });
    expect(spy).toHaveBeenCalledWith("signup", { plan: "free" });
  });

  it("never throws when no provider is configured", () => {
    expect(() => track("noop")).not.toThrow();
  });
});
