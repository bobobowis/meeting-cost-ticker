# Experiment charter — meeting-cost-ticker

> Fill this in **before** you start building. No Build stage without success and
> kill criteria. This is the studio's validation discipline in one file.

## Hypothesis

We believe that **[target user]** has problem **[problem]**, and that
**[this experiment]** solves it well enough that they will **[desired action:
sign up / return / pay / share]**.

## Riskiest assumption

The one belief that, if false, kills the experiment:

- …

## Success criteria (advance / scale)

Measurable, time-boxed. Examples — replace with real numbers:

- ≥ **X** unique visitors in the first **N** days
- ≥ **Y%** complete the core action (`track("...")`)
- ≥ **Z** returning users / week 2 retention above **__%**

## Kill criteria (stop)

If by **[date]** we see:

- < **X** visitors, or
- < **Y%** activation, or
- no qualitative signal of demand

→ stop, log the learning, move on.

## Measurement

- Primary metric: …
- Instrumented events: `track("...")` in `src/lib/analytics.ts`
- Analytics provider / dashboard: …

## Decision log

Record the advance / iterate / kill decision (with the numbers) in
[`docs/DECISIONS.md`](./docs/DECISIONS.md), and what you learned in
[`docs/LEARNINGS.md`](./docs/LEARNINGS.md).
