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

→ stop, log the learning in [`docs/LEARNINGS.md`](./LEARNINGS.md), and
advance the next idea (per the pick order, **Timezone Slot Finder #2**).

## Measurement

- **Primary metric:** activation rate = unique `ticker_start` / unique visitors.
- **Secondary:** return rate, referrers/shares, `share_click` count.
- **Instrumented events** (`src/lib/analytics.ts` → `track`):
  - `ticker_start` — meeting timer started (props: headcount, salary, rate/hr)
  - `ticker_pause` — paused (props: elapsed_seconds)
  - `ticker_reset` — reset (props: elapsed_seconds)
  - `share_click` — share/copy pressed (props: cost) — **this is the tracked
    CTA / acquisition-loop event** (LAB-9 referred to it generically as
    `cta_click`; the live, instrumented name is `share_click`).
- **Provider / dashboard:** Umami (EU region, `eu.umami.is`), wired live in
  **LAB-7**. Repo **Settings → Variables** carry `VITE_ANALYTICS_PROVIDER=umami`,
  `VITE_ANALYTICS_WEBSITE_ID`, `VITE_ANALYTICS_SRC=https://eu.umami.is/script.js`.
  Verified: real pageview + `share_click`/custom event land in the EU dashboard.

## Distribution & measurement window (LAB-9)

**Landing verification (2026-07-09):**

- ✅ **Value prop** — one-liner present: *"Watch the money burn in real time."*
  plus `<meta description>` and OpenGraph title/description in `index.html`.
- ✅ **Tracked CTA fires** — the share button calls `track("share_click", …)`
  before invoking the Web Share / clipboard fallback; verified live against the
  EU Umami dashboard in LAB-7. (Event is named `share_click`, not `cta_click`.)
- ⚠️ **Conversion gap — no `og:image`.** Link previews on HN / X / Reddit / PH
  render with no thumbnail, which measurably lowers click-through. Fix needs a
  1200×630 raster OG card (a screenshot/branded card). No image tooling in the
  build env and no browser capability here → **requested as an asset from QA /
  Lab Director** (see LAB-9 comment). Once the PNG exists: add
  `<meta property="og:image">` + switch `twitter:card` to `summary_large_image`.
- ℹ️ **Screenshot/gif for posts** — same blocker (needs browser capture);
  requested alongside the OG card.

**Distribution kit — ready-to-post copy.** Actual posting requires studio social
accounts (no HN / Reddit / X / Product Hunt credentials in this environment;
only GitHub `bobobowis`). Drafts below are approved-shape and ready for the Lab
Director / Growth to post. Log the live link + date in the table as each goes up.

| Channel | Status | Link | Posted (date) |
|---|---|---|---|
| Hacker News — Show HN | drafted, ready to post | _(paste)_ | _(paste)_ |
| Reddit — r/SideProject | drafted, ready to post | _(paste)_ | _(paste)_ |
| X / Twitter | drafted, ready to post | _(paste)_ | _(paste)_ |
| Product Hunt (optional 4th) | drafted, ready to post | _(paste)_ | _(paste)_ |

> Live URL for every post: <https://bobobowis.github.io/meeting-cost-ticker/>

**Hacker News — Show HN**

- Title: `Show HN: Meeting Cost Ticker – a live $ ticker of what your meeting costs`
- Body:
  > I built a tiny single-page tool that shows the running dollar cost of a
  > meeting in real time. Enter headcount + average salary, hit start, and a
  > per-second ticker counts up. No signup, no backend — everything runs in your
  > browser and inputs are saved to localStorage.
  >
  > It started as a joke about a recurring meeting that felt expensive but whose
  > cost was invisible; the shareable running total is the whole point. Free.
  > Feedback on the model (salary ÷ paid hours/yr, split per second) welcome.
  >
  > https://bobobowis.github.io/meeting-cost-ticker/

**Reddit — r/SideProject** (alt: r/webdev "Showoff", r/productivity)

- Title: `I made a free tool that shows the live $ cost of your meeting, ticking up per second`
- Body:
  > Enter how many people are in the meeting and an average salary, hit start,
  > and watch a per-second dollar ticker climb. No signup, no backend — runs
  > entirely in your browser. Built it because a recurring meeting *felt*
  > expensive but the cost was invisible. There's a one-tap "Share the damage"
  > button so you can drop the running total in chat. Would love feedback.
  >
  > https://bobobowis.github.io/meeting-cost-ticker/

**X / Twitter**

  > Ever sat in a meeting that *felt* expensive?
  >
  > Meeting Cost Ticker shows the live $ burn — enter headcount + salary, hit
  > start, watch the money go. No signup, runs in your browser.
  >
  > https://bobobowis.github.io/meeting-cost-ticker/

**Product Hunt** (optional 4th channel)

- Tagline: `Watch the money burn in real time`
- Description:
  > A live per-second dollar ticker for your meetings. Set headcount + average
  > salary, hit start, and watch the running cost climb. No signup, no backend —
  > everything runs in your browser. Share the running total to make the cost
  > visceral. Free. A 00-lab experiment.

**Measurement window**

- **Start:** 2026-07-09 (analytics live since LAB-7; window opens with the
  distribution push).
- **End / decision review:** **2026-07-23** (2 weeks).
- Measurement is **passive** — Umami collects automatically. Do **not** poll.
  At 2026-07-23, run the numbers against the Success/Kill criteria above and
  record the advance/iterate/kill decision (separate follow-up task).
- If the distribution push slips more than ~1 day past the start date,
  re-anchor start = first-post date and end = start + 14 days.

## Decision log

Advance / iterate / kill decision (with numbers) → [`docs/DECISIONS.md`](./DECISIONS.md).
What we learned → [`docs/LEARNINGS.md`](./LEARNINGS.md).
