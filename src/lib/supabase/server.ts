import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { parse, serialize } from "cookie";
import type { AdminPermission, AdminRole } from "@/lib/admin-auth";

type CookieMutation = { name: string; value: string; options: CookieOptions };

export type ServerSupabaseBundle = {
    client: SupabaseClient;
    /** Apply queued cookie mutations to an outgoing Response. */
    commit: (response: Response) => Response;
};

export type VerifiedAdmin = {
    user: User;
    bundle: ServerSupabaseBundle;
    role: AdminRole;
    permissions: AdminPermission[];
};

function readEnv(): { url: string; key: string } {
    const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
        throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
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
                for (let i = queued.length - 1; i >= 0; i--) {
                    if (queued[i].name === name) return queued[i].value;
                }
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

/** Verify the current request belongs to an admin_users user with role & permissions. */
export async function verifyAdminUser(
    request: Request,
): Promise<VerifiedAdmin | null> {
    const bundle = getSupabaseServerClient(request);
    const { data: { user } } = await bundle.client.auth.getUser();
    if (!user) return null;
    const { data: adminRow } = await bundle.client
        .from("admin_users")
        .select("id, role, permissions")
        .eq("id", user.id)
        .maybeSingle();

    if (!adminRow) return null;

    const role = (adminRow.role as AdminRole) || "editor";
    const permissions = Array.isArray(adminRow.permissions)
        ? (adminRow.permissions as AdminPermission[])
        : ["manage_team", "manage_requests", "manage_applications"];

    return {
        user,
        bundle,
        role,
        permissions,
    };
}

/** JSON helper that also commits any queued cookie mutations. */
export function jsonWithCookies(
    bundle: ServerSupabaseBundle,
    body: unknown,
    init?: ResponseInit,
): Response {
    const headers = new Headers(init?.headers);
    headers.set("content-type", "application/json");
    return bundle.commit(
        new Response(JSON.stringify(body), { ...init, headers }),
    );
}
