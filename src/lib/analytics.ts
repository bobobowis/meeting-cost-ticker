/**
 * Vendor-agnostic analytics hook.
 *
 * Every 00-lab experiment ships with usage measurement wired in by default so
 * external validation (traffic, recurring usage, conversion) is measurable from
 * day one — no per-experiment analytics plumbing required.
 *
 * Design goals:
 *  - Zero runtime dependencies. Pure DOM + fetch.
 *  - No vendor lock-in: a provider is selected via env vars, not code changes.
 *  - Safe by default: with no env config it becomes a dev-only console logger,
 *    so the template runs and builds cleanly before a provider is chosen.
 *
 * Configure via env (see .env.example):
 *  - VITE_ANALYTICS_PROVIDER = "plausible" | "umami" | "none" (default: "none")
 *  - VITE_ANALYTICS_DOMAIN   = site domain registered with the provider
 *  - VITE_ANALYTICS_SRC      = script URL (defaults per provider)
 *  - VITE_ANALYTICS_WEBSITE_ID = website id (umami)
 */

type Provider = "plausible" | "umami" | "none";

type EventProps = Record<string, string | number | boolean>;

interface AnalyticsConfig {
  provider: Provider;
  domain?: string;
  src?: string;
  websiteId?: string;
}

const DEFAULT_SRC: Record<Provider, string> = {
  plausible: "https://plausible.io/js/script.js",
  umami: "https://cloud.umami.is/script.js",
  none: "",
};

function readConfig(): AnalyticsConfig {
  const env = import.meta.env;
  const provider = (env.VITE_ANALYTICS_PROVIDER ?? "none") as Provider;
  return {
    provider,
    domain: env.VITE_ANALYTICS_DOMAIN,
    src: env.VITE_ANALYTICS_SRC ?? DEFAULT_SRC[provider],
    websiteId: env.VITE_ANALYTICS_WEBSITE_ID,
  };
}

let loaded = false;

/**
 * Injects the configured analytics provider's script tag. Idempotent and
 * SSR-safe (no-ops when there is no document). Call once at app startup.
 */
export function initAnalytics(config: AnalyticsConfig = readConfig()): void {
  if (loaded) return;
  if (typeof document === "undefined") return;

  if (config.provider === "none" || !config.src) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info(
        "[analytics] no provider configured — events log to console in dev only.",
      );
    }
    loaded = true;
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = config.src;

  if (config.provider === "plausible" && config.domain) {
    script.setAttribute("data-domain", config.domain);
  }
  if (config.provider === "umami" && config.websiteId) {
    script.setAttribute("data-website-id", config.websiteId);
  }

  document.head.appendChild(script);
  loaded = true;
}

/**
 * Tracks a custom event. Routes to whichever provider global is present; falls
 * back to a dev console log so instrumentation is visible before a provider is
 * wired. Never throws — analytics must not break the experiment.
 */
export function track(event: string, props?: EventProps): void {
  try {
    const w = globalThis as unknown as {
      plausible?: (e: string, opts?: { props?: EventProps }) => void;
      umami?: { track: (e: string, d?: EventProps) => void };
    };
    if (typeof w.plausible === "function") {
      w.plausible(event, props ? { props } : undefined);
      return;
    }
    if (w.umami?.track) {
      w.umami.track(event, props);
      return;
    }
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info("[analytics] track", event, props ?? {});
    }
  } catch {
    /* analytics is best-effort; never surface errors to the user */
  }
}
