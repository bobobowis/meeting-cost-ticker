import { describe, it, expect } from "vitest";
import { T, LOCALE, CURRENCY_SYMBOL, HOURS_PRESETS } from "./i18n";

describe("i18n", () => {
  it("has matching string keys across EN and ES", () => {
    const en = Object.keys(T.en).sort();
    const es = Object.keys(T.es).sort();
    expect(es).toEqual(en);
  });

  it("maps each language to a BCP-47 locale", () => {
    expect(LOCALE.en).toBe("en-US");
    expect(LOCALE.es).toBe("es-ES");
  });

  it("exposes USD/EUR symbols", () => {
    expect(CURRENCY_SYMBOL.USD).toBe("$");
    expect(CURRENCY_SYMBOL.EUR).toBe("€");
  });
});

describe("HOURS_PRESETS", () => {
  it("includes the board-provided Spain figures", () => {
    const byId = Object.fromEntries(HOURS_PRESETS.map((p) => [p.id, p.hours]));
    expect(byId["us-40"]).toBe(2080);
    expect(byId["es-40"]).toBe(1826);
    expect(byId["es-375"]).toBe(1690);
    expect(byId["es-35"]).toBe(1575);
  });

  it("labels every preset in both languages", () => {
    for (const p of HOURS_PRESETS) {
      expect(p.label.en.length).toBeGreaterThan(0);
      expect(p.label.es.length).toBeGreaterThan(0);
    }
  });
});
