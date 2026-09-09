import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function readEnv(...names: string[]): string | undefined {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const pEnv = typeof process !== "undefined" ? process.env : undefined;
  for (const name of names) {
    const val = env?.[name] || pEnv?.[name];
    if (val && typeof val === "string" && val.trim().length > 0) {
      return val.trim();
    }
  }
  return undefined;
}

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = readEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "VITE_SUPABASE_URL",
    "SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PROJECT_URL",
  );
  const key = readEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLIC_KEY",
    "SUPABASE_PUBLIC_ANON_KEY",
  );
  if (!url || !key) {
    throw new Error("Missing Supabase browser configuration. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or VITE_ equivalents) are defined.");
  }
  _client = createBrowserClient(url, key);
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/** Initiates Google SSO login via Supabase Auth */
export async function signInWithGoogle(redirectTo?: string) {
  const client = getSupabase();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const target = redirectTo || `${origin}/admin/auth/callback`;
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: target,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });
  if (error) throw error;
  return data;
}
