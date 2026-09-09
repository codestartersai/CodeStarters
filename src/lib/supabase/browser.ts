import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function readEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY"): string | undefined {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return env?.[name];
}

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = readEnv("VITE_SUPABASE_URL");
  const key = readEnv("VITE_SUPABASE_ANON_KEY");
  if (!url || !key) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
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
