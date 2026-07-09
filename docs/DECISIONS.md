# Decision log

Append-only. Newest on top. One entry per meaningful decision (stack choice,
scope cut, pivot, advance/iterate/kill gate). Keep it short — the point is a
traceable "why", not a novel.

## Format

```
## YYYY-MM-DD — <decision title>
- Context: what prompted this
- Decision: what we chose
- Alternatives: what we rejected and why
- Consequence / next: what this commits us to
```

---

## 2026-07-09 — Build v0: pure client-side ticker (LAB-5)
- Context: experiment #1 pick (Meeting Cost Ticker). Build → public launch on the
  static baseline. Success/kill criteria in the studio decision log (LAB-4 PICK).
- Decision: single-page app. Money math lives in a pure, unit-tested
  `src/lib/cost.ts` (perSecondCost / costAfter / formatUSD / formatElapsed);
  React `App.tsx` is timer + UI only. Elapsed time derives from `performance.now()`
  timestamps (not tick-counting) so pause/resume and backgrounded tabs stay
  accurate. rAF drives the display. Inputs persist to `localStorage` so a
  returning user resumes their setup (nudges the riskiest assumption: recurring use).
- Default assumption: salary ÷ **2080** paid hours/yr (40h × 52w), editable under
  "Assumptions". Share button uses the Web Share API, falling back to clipboard copy
  of a screenshot-style summary line — the intended organic-share loop.
- Alternatives: (a) counting ticks with setInterval — rejected, drifts and
  under-counts when throttled; (b) a component-level cost calc — rejected, math
  belongs in a testable pure module; (c) a backend to store/share sessions —
  rejected, off-baseline + spend, and unnecessary for a v0 virality read.
- Consequence / next: public deploy on GitHub Pages. Four events instrumented
  (`ticker_start`/`pause`/`reset`/`share_click`). Usage **collection** is gated on
  the analytics provider pick in **LAB-7** — see next entry.

## 2026-07-09 — Analytics collection gated on LAB-7 (provider pick)
- Context: LAB-5 success requires analytics *capturing usage*. Events are wired
  and fire, but the vendor-agnostic hook is a no-op until a provider is set via
  repo Variables (`VITE_ANALYTICS_PROVIDER`, …).
- Decision: ship public + correct now; do **not** unilaterally pick a provider —
  choosing one is a new external service / possible spend, which is a
  Lab-Director-owned call carried in **LAB-7**. Escalated on the LAB-5 thread.
- Alternatives: self-pick a free tier (e.g. Umami Cloud) — rejected, still a new
  external service and out of my lane per studio boundaries; a self-hosted
  collector — rejected, off-baseline (needs a server) + spend.
- Consequence / next: once LAB-7 lands a provider, set the repo Variables and
  redeploy — one config step, no code change. Then the 2-week measurement window
  starts against the success/kill criteria.

## 2026-07-09 — Scaffolded from studio template
- Context: new experiment created from 00-lab template.
- Decision: Vite + React + TS, GitHub Pages deploy, analytics wired by default.
- Alternatives: —
- Consequence / next: fill in EXPERIMENT.md before Build.
