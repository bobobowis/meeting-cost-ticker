# Experiment charter — meeting-cost-ticker

> 00-lab experiment #1. Success + kill criteria set at the Validation→Prototype
> gate (Lab Director pick, 2026-07-09) — see the studio `docs/DECISIONS.md`
> → *LAB-4: Experiment #1 PICK*.

## Hypothesis

We believe that **managers / meeting-skeptics** have the problem that **a
recurring meeting feels expensive but the cost is invisible**, and that **a live
per-second dollar ticker they can screenshot** makes the cost visceral enough
that they will **share it** — the shareable running total is the intended
acquisition loop.

## Riskiest assumption

- That anyone **returns** after the first laugh — i.e. that there is *recurring*
  usage or an organic **share/referral** signal, not just a one-time gag. This is
  the single belief the studio needs validated for a real signal.

## Success criteria (advance / scale)

Measured 2 weeks post-launch, one lightweight distribution push, no paid ads:

- ≥ **150 unique visitors**, AND
- ≥ **40%** start a ticker (`track("ticker_start")` / unique visitors), AND
- a measurable loop signal: **≥ 5% return** within the window **OR ≥ 1 organic
  external share / referrer** (retention is the riskiest assumption).

## Kill criteria (stop)

At the 2-week mark, if:

- < **50 unique visitors**, OR
- < **20%** activation, OR
- **zero** share/return signal

→ stop, log the learning in [`docs/LEARNINGS.md`](./docs/LEARNINGS.md), and
advance the next idea (per the pick order, **Timezone Slot Finder #2**).

## Measurement

- **Primary metric:** activation rate = unique `ticker_start` / unique visitors.
- **Secondary:** return rate, referrers/shares, `share_click` count.
- **Instrumented events** (`src/lib/analytics.ts` → `track`):
  - `ticker_start` — meeting timer started (props: headcount, salary, rate/hr)
  - `ticker_pause` — paused (props: elapsed_seconds)
  - `ticker_reset` — reset (props: elapsed_seconds)
  - `share_click` — share/copy pressed (props: cost)
- **Provider / dashboard:** configured via repo **Settings → Variables**
  (`VITE_ANALYTICS_PROVIDER`, …). Provider pick is tracked in **LAB-7**; until it
  is set, the deploy is public + correct and events fire, but usage is not yet
  collected. See [`docs/DECISIONS.md`](./docs/DECISIONS.md).

## Decision log

Advance / iterate / kill decision (with numbers) → [`docs/DECISIONS.md`](./docs/DECISIONS.md).
What we learned → [`docs/LEARNINGS.md`](./docs/LEARNINGS.md).
