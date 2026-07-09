import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { track } from "./lib/analytics";
import {
  perSecondCost,
  costAfter,
  formatUSD,
  formatElapsed,
  DEFAULT_HOURS_PER_YEAR,
} from "./lib/cost";

/** Persist the last-used inputs so a returning user picks up where they left. */
const STORE_KEY = "mct.inputs.v1";

interface Inputs {
  headcount: number;
  salary: number;
  hoursPerYear: number;
}

const DEFAULTS: Inputs = {
  headcount: 5,
  salary: 85000,
  hoursPerYear: DEFAULT_HOURS_PER_YEAR,
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
    };
  } catch {
    return DEFAULTS;
  }
}

export default function App() {
  const [inputs, setInputs] = useState<Inputs>(loadInputs);
  const [running, setRunning] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share the damage");

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

  const share = async () => {
    const text =
      `This meeting has already burned ${formatUSD(cost)} ` +
      `(${inputs.headcount} people, ${formatElapsed(elapsedSeconds)}). ` +
      `Was it worth it? → Meeting Cost Ticker`;
    track("share_click", { cost: Math.round(cost) });
    try {
      if (navigator.share) {
        await navigator.share({ text, url: location.href });
      } else {
        await navigator.clipboard.writeText(`${text} ${location.href}`);
        setShareLabel("Copied to clipboard ✓");
        setTimeout(() => setShareLabel("Share the damage"), 2000);
      }
    } catch {
      /* user dismissed share sheet or clipboard blocked; non-fatal */
    }
  };

  const num = (v: string) => Math.max(0, Number(v.replace(/[^0-9.]/g, "")) || 0);

  return (
    <main className="wrap">
      <header className="head">
        <h1>Meeting Cost Ticker</h1>
        <p className="tag">Watch the money burn in real time.</p>
      </header>

      <section className="ticker">
        <div className="cost" aria-label={`Cost so far ${formatUSD(cost)}`}>
          {formatUSD(cost)}
        </div>
        <div className="meta">
          <span className="clock">{formatElapsed(elapsedSeconds)}</span>
          <span className="dot">·</span>
          <span>{formatUSD(rate * 3600)}/hr</span>
          <span className="dot">·</span>
          <span>{formatUSD(rate * 60)}/min</span>
        </div>
      </section>

      <section className="controls">
        {running ? (
          <button type="button" className="btn primary" onClick={pause}>
            Pause
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={start}>
            {elapsedMs > 0 ? "Resume" : "Start meeting"}
          </button>
        )}
        <button
          type="button"
          className="btn"
          onClick={reset}
          disabled={elapsedMs === 0 && !running}
        >
          Reset
        </button>
        <button type="button" className="btn ghost" onClick={share}>
          {shareLabel}
        </button>
      </section>

      <section className="inputs">
        <label className="field">
          <span>People in the meeting</span>
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
          <span>Average salary ($/yr)</span>
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
          {showAdvanced ? "− Assumptions" : "+ Assumptions"}
        </button>
        {showAdvanced && (
          <label className="field">
            <span>Paid working hours / year</span>
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
      </section>

      <footer className="foot">
        <p>
          Estimate only — salary ÷ {inputs.hoursPerYear.toLocaleString()} paid
          hours/yr, split per second. Nothing leaves your browser.
        </p>
        <p className="credit">
          A <a href="https://github.com/bobobowis">00-lab</a> experiment.
        </p>
      </footer>
    </main>
  );
}
