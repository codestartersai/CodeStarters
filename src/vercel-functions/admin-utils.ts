import type { IncomingMessage, ServerResponse } from "node:http";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parse } from "cookie";

export type AdminEnv = {
  url: string;
  anonKey: string;
  serviceKey: string;
};

export function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
}

export async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function getRequestUrl(req: IncomingMessage): URL {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  return new URL(req.url ?? "/", `${proto}://${host}`);
}

export function getAdminEnv(): AdminEnv {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    "";
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    anonKey;
  if (!url || !anonKey || !serviceKey) throw new Error("MISSING_SUPABASE_CONFIG");
  return { url, anonKey, serviceKey };
}

export function getAdminClient(env: AdminEnv): SupabaseClient {
  return createClient(env.url, env.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function verifyAdmin(req: IncomingMessage, env: AdminEnv): Promise<boolean> {
  try {
    const cookies = parse(req.headers.cookie ?? "");
    const supabase = createServerClient(env.url, env.anonKey, {
      cookies: {
        get(name: string) {
          return cookies[name];
        },
        set() {},
        remove() {},
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const admin = getAdminClient(env);
    const { data: adminRow, error } = await admin
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (error) console.error("Admin user lookup failed:", error);
    return Boolean(adminRow);
  } catch (error) {
    console.error("Admin verification failed:", error);
    return false;
  }
}
