import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function readEnv(...names: string[]): string | undefined {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return names.map((name) => env?.[name]).find(Boolean);
}

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = readEnv("VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const key = readEnv("VITE_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !key) {
    throw new Error("Missing Supabase browser configuration");
  }
  _client = createBrowserClient(url, key);
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
