/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANALYTICS_PROVIDER?: "plausible" | "umami" | "none";
  readonly VITE_ANALYTICS_DOMAIN?: string;
  readonly VITE_ANALYTICS_SRC?: string;
  readonly VITE_ANALYTICS_WEBSITE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
