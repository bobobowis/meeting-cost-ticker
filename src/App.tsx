import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { track } from "./lib/analytics";
import {
  perSecondCost,
  costAfter,
  formatMoney,
  formatElapsed,
  DEFAULT_HOURS_PER_YEAR,
} from "./lib/cost";
import {
  T,
  LOCALE,
  CURRENCY_SYMBOL,
  HOURS_PRESETS,
  type Lang,
  type Currency,
} from "./lib/i18n";

/** Persist the last-used inputs so a returning user picks up where they left. */
const STORE_KEY = "mct.inputs.v2";

/**
 * Phase 0 monetization test (LAB-9, board-approved 2026-07-09). Zero backend:
 * the `pricing_click` / `tip_click` events are the willingness-to-pay signal;
 * the links are honest "raise your hand" paths. Swap these two constants to
 * point at a real inbox / sponsor page without touching component logic.
 */
const TEAMS_WAITLIST_URL =
  "https://github.com/bobobowis/meeting-cost-ticker/issues/new?labels=waitlist&title=" +
  encodeURIComponent("Interested in Meeting Cost Ticker for Teams") +
  "&body=" +
  encodeURIComponent(
    "I'd use a Teams version (shared dashboards / SSO / per-team cost history).\n\nWhat I'd want: \nTeam size: ",
  );
const TIP_URL = "https://github.com/sponsors/bobobowis";

interface Inputs {
  headcount: number;
  salary: number;
  hoursPerYear: number;
  presetId: string;
  lang: Lang;
  currency: Currency;
}

const DEFAULTS: Inputs = {
  headcount: 5,
  salary: 85000,
  hoursPerYear: DEFAULT_HOURS_PER_YEAR,
  presetId: "us-40",
  lang: "en",
  currency: "USD",
};

function loadInputs(): Inputs {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Inputs>;
    return {
      headcount: Number(parsed.headcount) || DEFAULTS.headcount,
      salary: Number(parsed.salary) || DEFAULTS.salary,
      hoursPerYear: Number(parsed.hoursPerYear) || DEFAULTS.hoursPerYear,
      presetId: parsed.presetId ?? DEFAULTS.presetId,
      lang: parsed.lang === "es" ? "es" : "en",
      currency: parsed.currency === "EUR" ? "EUR" : "USD",
    };
  } catch {
    return DEFAULTS;
  }
}

const CUSTOM = "custom";

export default function App() {
  const [inputs, setInputs] = useState<Inputs>(loadInputs);
  const [running, setRunning] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [teamsOpen, setTeamsOpen] = useState(false);

  const t = T[inputs.lang];
  const locale = LOCALE[inputs.lang];
  const money = (n: number) => formatMoney(n, inputs.currency, locale);

  // Elapsed time is derived from wall-clock timestamps so it stays accurate even
  // if the tab is backgrounded and rAF throttles. `elapsedMs` is the display
  // value; `accumulatedMs` + `startedAt` are the source of truth.
  const [elapsedMs, setElapsedMs] = useState(0);
  const accumulatedMs = useRef(0);
  const startedAt = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  const rate = useMemo(
    () => perSecondCost(inputs.headcount, inputs.salary, inputs.hoursPerYear),
    [inputs],
  );

  const elapsedSeconds = elapsedMs / 1000;
  const cost = costAfter(elapsedSeconds, rate);

  // Persist inputs whenever they change.
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(inputs));
    } catch {
      /* storage may be unavailable (private mode); non-fatal */
    }
  }, [inputs]);

  // Keep <html lang> in sync for a11y + correct hyphenation.
  useEffect(() => {
    document.documentElement.lang = inputs.lang;
  }, [inputs.lang]);

  const tick = useCallback(() => {
    if (startedAt.current !== null) {
      setElapsedMs(accumulatedMs.current + (performance.now() - startedAt.current));
    }
    rafId.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (running) {
      startedAt.current = performance.now();
      rafId.current = requestAnimationFrame(tick);
      return () => {
        if (rafId.current !== null) cancelAnimationFrame(rafId.current);
        if (startedAt.current !== null) {
          accumulatedMs.current += performance.now() - startedAt.current;
          startedAt.current = null;
        }
      };
    }
  }, [running, tick]);

  const start = () => {
    setRunning(true);
    track("ticker_start", {
      headcount: inputs.headcount,
      salary: inputs.salary,
      currency: inputs.currency,
      lang: inputs.lang,
      rate_per_hour: Math.round(rate * 3600),
    });
  };
  const pause = () => {
    setRunning(false);
    track("ticker_pause", { elapsed_seconds: Math.round(elapsedSeconds) });
  };
  const reset = () => {
    setRunning(false);
    accumulatedMs.current = 0;
    startedAt.current = null;
    setElapsedMs(0);
    track("ticker_reset", { elapsed_seconds: Math.round(elapsedSeconds) });
  };

  const shareText = t.shareText(money(cost), inputs.headcount, formatElapsed(elapsedSeconds));

  const shareTo = async (channel: string) => {
    track("share_click", { channel, cost: Math.round(cost), lang: inputs.lang });
    const url = location.href;
    const enc = encodeURIComponent;
    const links: Record<string, string> = {
      x: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
      whatsapp: `https://wa.me/?text=${enc(`${shareText} ${url}`)}`,
    };
    if (channel === "copy") {
      try {
        await navigator.clipboard.writeText(`${shareText} ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* clipboard blocked; non-fatal */
      }
      return;
    }
    window.open(links[channel], "_blank", "noopener,noreferrer");
  };

  // Phase 0 fake-door: opening the panel is the primary paid-demand signal.
  const openTeams = () => {
    if (!teamsOpen) track("pricing_click", { tier: "teams", lang: inputs.lang });
    setTeamsOpen((o) => !o);
  };
  const teamsNotify = () => {
    track("pricing_click", { tier: "teams", intent: "notify", lang: inputs.lang });
    window.open(TEAMS_WAITLIST_URL, "_blank", "noopener,noreferrer");
  };
  const tip = () => {
    track("tip_click", { lang: inputs.lang });
    window.open(TIP_URL, "_blank", "noopener,noreferrer");
  };

  const num = (v: string) => Math.max(0, Number(v.replace(/[^0-9.]/g, "")) || 0);

  const onPreset = (id: string) => {
    if (id === CUSTOM) {
      setInputs((p) => ({ ...p, presetId: CUSTOM }));
      return;
    }
    const preset = HOURS_PRESETS.find((h) => h.id === id);
    if (preset) {
      setInputs((p) => ({ ...p, presetId: id, hoursPerYear: preset.hours }));
    }
  };

  return (
    <main className="wrap">
      <div className="topbar">
        <div className="seg" role="group" aria-label="Language">
          {(["en", "es"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              className={`seg-btn ${inputs.lang === l ? "on" : ""}`}
              aria-pressed={inputs.lang === l}
              onClick={() => setInputs((p) => ({ ...p, lang: l }))}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="seg" role="group" aria-label="Currency">
          {(["USD", "EUR"] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              className={`seg-btn ${inputs.currency === c ? "on" : ""}`}
              aria-pressed={inputs.currency === c}
              onClick={() => setInputs((p) => ({ ...p, currency: c }))}
            >
              {CURRENCY_SYMBOL[c]}
            </button>
          ))}
        </div>
      </div>

      <header className="head">
        <h1>Meeting Cost Ticker</h1>
        <p className="tag">{t.tagline}</p>
      </header>

      <section className="ticker">
        <div className="cost" aria-label={t.costAria(money(cost))}>
          {money(cost)}
        </div>
        <div className="meta">
          <span className="clock">{formatElapsed(elapsedSeconds)}</span>
          <span className="dot">·</span>
          <span>
            {money(rate * 3600)}
            {t.perHr}
          </span>
          <span className="dot">·</span>
          <span>
            {money(rate * 60)}
            {t.perMin}
          </span>
        </div>
      </section>

      <section className="controls">
        {running ? (
          <button type="button" className="btn primary" onClick={pause}>
            {t.pause}
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={start}>
            {elapsedMs > 0 ? t.resume : t.start}
          </button>
        )}
        <button
          type="button"
          className="btn"
          onClick={reset}
          disabled={elapsedMs === 0 && !running}
        >
          {t.reset}
        </button>
      </section>

      <section className="share" aria-label={t.shareHeading}>
        <span className="share-label">{t.shareHeading}</span>
        <div className="share-btns">
          <button type="button" className="sbtn x" onClick={() => shareTo("x")} aria-label="X">
            𝕏
          </button>
          <button
            type="button"
            className="sbtn in"
            onClick={() => shareTo("linkedin")}
            aria-label="LinkedIn"
          >
            in
          </button>
          <button
            type="button"
            className="sbtn wa"
            onClick={() => shareTo("whatsapp")}
            aria-label="WhatsApp"
          >
            WA
          </button>
          <button type="button" className="sbtn copy" onClick={() => shareTo("copy")}>
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </section>

      <section className="upsell">
        <button
          type="button"
          className="teams-cta"
          onClick={openTeams}
          aria-expanded={teamsOpen}
        >
          {t.teamsCta}
        </button>
        {teamsOpen && (
          <div className="teams-panel">
            <p>{t.teamsBlurb}</p>
            <button type="button" className="btn primary" onClick={teamsNotify}>
              {t.teamsNotify}
            </button>
          </div>
        )}
        <button type="button" className="tip" onClick={tip}>
          {t.tipCta}
        </button>
      </section>

      <section className="inputs">
        <label className="field">
          <span>{t.people}</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={inputs.headcount}
            onChange={(e) =>
              setInputs((p) => ({ ...p, headcount: num(e.target.value) }))
            }
          />
        </label>
        <label className="field">
          <span>{t.salary(CURRENCY_SYMBOL[inputs.currency])}</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={inputs.salary}
            onChange={(e) =>
              setInputs((p) => ({ ...p, salary: num(e.target.value) }))
            }
          />
        </label>

        <button
          type="button"
          className="advanced-toggle"
          onClick={() => setShowAdvanced((s) => !s)}
          aria-expanded={showAdvanced}
        >
          {showAdvanced ? `− ${t.assumptions}` : `+ ${t.assumptions}`}
        </button>
        {showAdvanced && (
          <>
            <label className="field">
              <span>{t.region}</span>
              <select value={inputs.presetId} onChange={(e) => onPreset(e.target.value)}>
                {HOURS_PRESETS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.label[inputs.lang]}
                  </option>
                ))}
                <option value={CUSTOM}>{t.custom}</option>
              </select>
            </label>
            {inputs.presetId === CUSTOM && (
              <label className="field">
                <span>{t.region}</span>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={inputs.hoursPerYear}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, hoursPerYear: num(e.target.value) }))
                  }
                />
              </label>
            )}
          </>
        )}
      </section>

      <footer className="foot">
        <p>{t.footer(inputs.hoursPerYear.toLocaleString(locale))}</p>
        <p className="credit">
          <a href="https://github.com/bobobowis">{t.credit}</a>
        </p>
      </footer>
    </main>
  );
}
