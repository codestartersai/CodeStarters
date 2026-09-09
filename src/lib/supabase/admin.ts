import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;

export function resolveEnv(keys: string[]): string | undefined {
  for (const k of keys) {
    if (typeof process !== "undefined" && process.env && process.env[k]) {
      return process.env[k];
    }
    try {
      // @ts-ignore
      if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[k]) {
        // @ts-ignore
        return import.meta.env[k];
      }
    } catch {
      // Ignore
    }
  }
  return undefined;
}

export function isServiceRoleConfigured(): boolean {
  const serviceKey = resolveEnv([
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_KEY",
    "SUPABASE_SECRET_KEY",
    "SERVICE_ROLE_KEY",
    "SUPABASE_ADMIN_KEY",
  ]);
  return Boolean(serviceKey && serviceKey.trim());
}

export function getSupabaseAdminClient(): SupabaseClient {
  if (_admin) return _admin;
  const url = resolveEnv([
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL",
    "VITE_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PROJECT_URL",
  ]);

  const key = resolveEnv([
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_KEY",
    "SUPABASE_SECRET_KEY",
    "SERVICE_ROLE_KEY",
    "SUPABASE_ADMIN_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
    "VITE_SUPABASE_ANON_KEY",
  ]);

  if (!url || !key) {
    throw new Error("Missing Supabase admin configuration (checked SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)");
  }
  _admin = createClient(url.trim(), key.trim(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return _admin;
}

/**
 * Adaptively upserts an admin user record into the admin_users table.
 * If the user's Supabase table schema lacks certain optional columns (e.g. 'name', 'permissions'),
 * it automatically identifies the missing column from PostgREST, strips it from the payload, and retries.
 */
export async function adaptiveUpsertAdminUser(
  client: SupabaseClient,
  initialPayload: Record<string, any>
): Promise<{ data: any; error: any }> {
  let currentPayload = { ...initialPayload };

  for (let attempt = 0; attempt < 8; attempt++) {
    const { data, error } = await client
      .from("admin_users")
      .upsert(currentPayload);

    if (!error) {
      return { data, error: null };
    }

    const msg = error.message || "";
    // Match "Could not find the 'xyz' column of 'admin_users' in the schema cache"
    const match = msg.match(/Could not find the '([^']+)' column/i);
    if (match && match[1]) {
      const missingColumn = match[1];
      console.warn(`[Supabase] Column '${missingColumn}' not in 'admin_users' table. Retrying without it...`);
      delete currentPayload[missingColumn];
      continue;
    }

    return { data: null, error };
  }

  // Fallback to absolute minimum columns { id, email }
  const minimalPayload: Record<string, any> = {
    id: initialPayload.id,
    email: initialPayload.email,
  };
  return await client.from("admin_users").upsert(minimalPayload);
}
