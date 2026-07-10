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
- ✅ **`og:image` — CLOSED (Path B, board pick 2026-07-09).** Programmatic
  1200×630 OG card generated at build by `scripts/generate-og.mjs`
  (satori → resvg, pure JS+WASM, no headless browser → runs in CI). Wired
  `og:image` + `twitter:card=summary_large_image` in `index.html`. The generator
  + vendored fonts are **reusable studio infra** — copy the script and edit the
  `CARD` config for any future experiment. Doubles as the post thumbnail/gif.
- ✅ **Localization EN/ES + EUR/USD** — UI, share text, and regional
  working-hours presets (US 2,080; Spain 40h 1,826 / 37.5h 1,690 / 35h 1,575 per
  board feedback) in `src/lib/i18n.ts`. Language + currency toggles in the top bar.
- ✅ **Social share buttons** — X, LinkedIn, WhatsApp, Copy; each fires
  `track("share_click", { channel, … })` so per-channel conversion is measurable.
- ✅ **Deployed live (2026-07-09)** — PR #1 (`lab-9/localize-social-og`) squash-merged
  to `main` (`4efeab57`); Pages Deploy succeeded. Verified live:
  `https://bobobowis.github.io/meeting-cost-ticker/og.png` → **HTTP 200** (62 KB),
  `og:image` = absolute `.../og.png`, `twitter:card=summary_large_image`. All Path B
  + i18n + presets + social-button work is now in production.

**Distribution results — LIVE (2026-07-10).** ≥2-channel bar met: **X + Product
Hunt** posted. HN + Reddit blocked by new-account gates (not a copy problem —
`bobobowis` has no karma/tenure yet); re-attempt after the account builds
standing, or use an established account.

| Channel | Status | Link | Posted (date) |
|---|---|---|---|
| X / Twitter | ✅ **POSTED** | <https://x.com/withbowis/status/2075305783382716695> | 2026-07-10 |
| Product Hunt | ✅ **POSTED** | <https://www.producthunt.com/products/meeting-cost-tickers> | 2026-07-10 |
| Hacker News — Show HN | ⛔ **blocked** — Show HN temporarily restricted for new/unfamiliar accounts (site influx); build HN standing first, then post an occasional Show HN | — | — |
| Reddit — r/SideProject | ⛔ **removed** by Reddit's spam filter (new account); retry from an aged account or after karma | — | — |

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

- **Start:** 2026-07-09 (analytics live since LAB-7). Distribution push went live
  2026-07-10 (within ~1 day of start → window not re-anchored).
- **End / decision review:** **2026-07-23** (2 weeks).
- Measurement is **passive** — Umami collects automatically. Do **not** poll.
  At 2026-07-23, run the numbers against the Success/Kill criteria above and
  record the advance/iterate/kill decision (separate follow-up task).
- If the distribution push slips more than ~1 day past the start date,
  re-anchor start = first-post date and end = start + 14 days.

## Phase 0 monetization test (LAB-9, board-approved 2026-07-09)

Cheap willingness-to-pay probe, run **inside** the existing 07-09 → 07-23 window.
No backend, no paid infra, no design spend — reuses the live `track()` pipe.

**Shipped in-app:**

- **Fake-door "Meeting Cost for Teams →"** CTA. Opening the panel fires
  `track("pricing_click", { tier: "teams" })`; the "I'd use this →" button fires
  `pricing_click` with `intent: "notify"` and opens a prefilled GitHub **waitlist**
  issue (zero-account for the studio, honest raise-your-hand path). Demand is
  measured by the event regardless of whether the issue is filed.
- **Tip jar** — "☕ Buy me a coffee" → GitHub Sponsors (`/sponsors/bobobowis`),
  fires `track("tip_click")`. Passive baseline revenue signal.
- Both links are swappable constants (`TEAMS_WAITLIST_URL`, `TIP_URL`) at the top
  of `src/App.tsx` — point them at a real inbox / sponsor page without code logic
  changes. EN/ES localized.

**Instrumented events (added):**

- `pricing_click` — Teams fake-door engaged (props: `tier`, optional `intent`, `lang`).
- `tip_click` — tip jar pressed (props: `lang`).

**Monetization greenlight thresholds** (evaluate at 2026-07-23 alongside the
main Success/Kill criteria). Greenlight building a paid tier if **either**:

- ≥ **5%** of unique visitors fire `pricing_click` (paid-tier interest), **OR**
- ≥ **3** waitlist issues **OR** ≥ **1** tip / sponsor.

Below both → no paid tier; keep it a free utility (or kill per the main criteria).

## Decision log

Advance / iterate / kill decision (with numbers) → [`docs/DECISIONS.md`](./DECISIONS.md).
What we learned → [`docs/LEARNINGS.md`](./LEARNINGS.md).
