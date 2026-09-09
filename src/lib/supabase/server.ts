import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { parse, serialize } from "cookie";
import { getSupabaseAdminClient } from "./admin";

type CookieMutation = { name: string; value: string; options: CookieOptions };

export type ServerSupabaseBundle = {
  client: SupabaseClient;
  /** Apply queued cookie mutations to an outgoing Response. */
  commit: (response: Response) => Response;
};

function readEnv(): { url: string; key: string } {
  const url =
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase server configuration");
  }
  return { url, key };
}

export function getSupabaseServerClient(request: Request): ServerSupabaseBundle {
  const { url, key } = readEnv();
  const cookieHeader = request.headers.get("cookie") ?? "";
  const incoming = parse(cookieHeader);
  const queued: CookieMutation[] = [];

  const client = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        const fresh = queued.findLast?.((c) => c.name === name);
        if (fresh) return fresh.value;
        return incoming[name];
      },
      set(name: string, value: string, options: CookieOptions) {
        queued.push({ name, value, options });
      },
      remove(name: string, options: CookieOptions) {
        queued.push({ name, value: "", options: { ...options, maxAge: 0 } });
      },
    },
  });

  const commit = (response: Response): Response => {
    if (queued.length === 0) return response;
    const headers = new Headers(response.headers);
    for (const { name, value, options } of queued) {
      headers.append("set-cookie", serialize(name, value, options as never));
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };

  return { client, commit };
}

/** Verify the current request belongs to an admin_users user. */
export async function verifyAdminUser(
  request: Request,
): Promise<{ user: User; bundle: ServerSupabaseBundle } | null> {
  const bundle = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await bundle.client.auth.getUser();
  if (!user) return null;
  const admin = getSupabaseAdminClient();
  const { data: adminRow } = await admin
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  return adminRow ? { user, bundle } : null;
}

/** JSON helper that also commits any queued cookie mutations. */
export function jsonWithCookies(
  bundle: ServerSupabaseBundle,
  body: unknown,
  init?: ResponseInit,
): Response {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  return bundle.commit(new Response(JSON.stringify(body), { ...init, headers }));
}
