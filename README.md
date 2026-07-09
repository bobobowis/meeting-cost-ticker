# meeting-cost-ticker

> One-line pitch: what this experiment is and who it's for.

A 00-lab experiment, scaffolded from the [studio template](../../README.md).

## Status

`Idea → Research → Validation → Prototype → Build → Launch → Measure → Iterate/Kill/Scale`

Current stage: **Prototype**

- Charter & kill criteria: [`EXPERIMENT.md`](./EXPERIMENT.md)
- Decisions: [`docs/DECISIONS.md`](./docs/DECISIONS.md)
- Learnings: [`docs/LEARNINGS.md`](./docs/LEARNINGS.md)
- Live URL: _(set after first deploy — `https://<owner>.github.io/<repo>/`)_

## Develop

```bash
npm install
cp .env.example .env   # optional: pick an analytics provider
npm run dev
```

## Verify

```bash
npm run typecheck   # tsc --noEmit
npm test            # vitest
npm run build       # production build
```

## Deploy

Pushing to `main` runs CI, then publishes to GitHub Pages via
`.github/workflows/deploy.yml`. Enable Pages once under
**Settings → Pages → Source: GitHub Actions** (the studio's
`new-experiment.sh` does this automatically).

## Analytics

Usage tracking is wired in via `src/lib/analytics.ts`. Configure a provider in
repo **Settings → Variables** (`VITE_ANALYTICS_PROVIDER`, `VITE_ANALYTICS_DOMAIN`,
…) so the deployed build reports real usage. Track custom events with:

```ts
import { track } from "./lib/analytics";
track("signup", { plan: "free" });
```
