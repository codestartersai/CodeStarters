// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

// Automatically inject all variables from .env / .env.local into process.env in Node SSR
try {
  const loaded = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
  for (const [k, v] of Object.entries(loaded)) {
    if (!process.env[k] && v) {
      process.env[k] = v;
    }
  }
} catch {
  // Ignore in restricted environments
}

export default defineConfig({
  cloudflare: false,
  vite: {
    envPrefix: ["VITE_", "NEXT_PUBLIC_", "SUPABASE_", "GMAIL_"],
  },
  tanstackStart: {
    server: { preset: "vercel" },
  },
});
