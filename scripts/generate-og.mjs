/**
 * Programmatic Open Graph image generator — 00-lab reusable studio infra.
 *
 * Renders a 1200×630 social-share card to `public/og.png` at build time using
 * satori (HTML/CSS → SVG) + resvg (SVG → PNG). Pure JS + WASM — no headless
 * browser, so it runs in CI (GitHub Actions) with zero extra services.
 *
 * Reuse across experiments: copy this file + `assets/fonts/`, then edit the
 * CARD config below (title, subtitle, hero, brand). Wire into `package.json`
 * build as `node scripts/generate-og.mjs && vite build`.
 *
 * Chosen over a one-off screenshot (LAB-9 Path B) because it is deterministic,
 * regenerates on every deploy, and is shared infrastructure — not throwaway art.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

/** ── Card config — edit per experiment ─────────────────────────────────── */
const CARD = {
  title: "Meeting Cost Ticker",
  subtitle: "Watch the money burn — live, per second.",
  hero: "$1,284.60",
  heroCaption: "8 people · 00:37:12 · was it worth it?",
  brand: "a 00-lab experiment",
  out: "public/og.png",
};

const COLORS = {
  bg: "#0e0d12",
  ink: "#f5f2ea",
  muted: "#9a93a6",
  ember: "#ff7a1a",
  ember2: "#ffb43d",
  line: "#2a2732",
};

const fonts = [
  {
    name: "Liberation Sans",
    data: readFileSync(resolve(root, "assets/fonts/LiberationSans-Regular.ttf")),
    weight: 400,
    style: "normal",
  },
  {
    name: "Liberation Sans",
    data: readFileSync(resolve(root, "assets/fonts/LiberationSans-Bold.ttf")),
    weight: 800,
    style: "normal",
  },
];

/** Minimal hyperscript so we can build the tree without JSX/a bundler. */
const h = (type, style, ...children) => ({
  type,
  props: { style, children: children.length === 1 ? children[0] : children },
});

const tree = h(
  "div",
  {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "72px",
    background: `radial-gradient(1200px 600px at 50% -20%, #2a1a10 0%, ${COLORS.bg} 60%)`,
    fontFamily: "Liberation Sans",
  },
  h(
    "div",
    { display: "flex", flexDirection: "column" },
    h("div", { fontSize: 40, fontWeight: 800, color: COLORS.ink, letterSpacing: "-0.02em" }, CARD.title),
    h("div", { marginTop: 12, fontSize: 30, color: COLORS.muted }, CARD.subtitle),
  ),
  h(
    "div",
    { display: "flex", flexDirection: "column", alignItems: "center" },
    h(
      "div",
      { fontSize: 168, fontWeight: 800, color: COLORS.ember, letterSpacing: "-0.03em", lineHeight: 1 },
      CARD.hero,
    ),
    h("div", { marginTop: 20, fontSize: 28, color: COLORS.ember2 }, CARD.heroCaption),
  ),
  h(
    "div",
    { display: "flex", justifyContent: "flex-end", fontSize: 24, color: COLORS.muted },
    CARD.brand,
  ),
);

const svg = await satori(tree, { width: 1200, height: 630, fonts });
const png = new Resvg(svg, { background: COLORS.bg }).render().asPng();

const outPath = resolve(root, CARD.out);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, png);
console.log(`[og] wrote ${CARD.out} (${(png.length / 1024).toFixed(1)} KB)`);
