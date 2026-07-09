/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// BASE_PATH is injected by the deploy workflow so GitHub Pages serves the app
// from /<repo-name>/. Defaults to "/" for local dev and custom domains.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  test: {
    environment: "node",
  },
});
