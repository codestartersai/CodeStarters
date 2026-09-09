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

import { resolveEnv } from "@/lib/supabase/admin";

function readEnv(): { url: string; key: string } {
    const url = resolveEnv([
        "NEXT_PUBLIC_SUPABASE_URL",
        "SUPABASE_URL",
        "VITE_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_PROJECT_URL",
    ]);
    const key = resolveEnv([
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_ANON_KEY",
        "VITE_SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_SUPABASE_PUBLIC_KEY",
        "SUPABASE_PUBLIC_ANON_KEY",
    ]);
    if (!url || !key) {
        throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY (checked NEXT_PUBLIC_SUPABASE_URL, SUPABASE_URL, VITE_SUPABASE_URL)");
    }
    return { url: url.trim(), key: key.trim() };
}

export function getSupabaseServerClient(request: Request): ServerSupabaseBundle {
    const { url, key } = readEnv();
    const cookieHeader = request.headers.get("cookie") ?? "";
    const incoming = parse(cookieHeader);
    const queued: CookieMutation[] = [];

    const client = createServerClient(url, key, {
        cookies: {
            getAll() {
                const cookieHeader = request.headers.get("cookie") ?? "";
                const parsed = parse(cookieHeader);
                const cookieMap = new Map<string, string>();
                for (const [k, v] of Object.entries(parsed)) {
                    if (typeof v === "string") cookieMap.set(k, v);
                }
                for (const item of queued) {
                    cookieMap.set(item.name, item.value);
                }
                return Array.from(cookieMap.entries()).map(([name, value]) => ({ name, value }));
            },
            setAll(cookiesToSet) {
                for (const { name, value, options } of cookiesToSet) {
                    queued.push({ name, value, options: options as CookieOptions });
                }
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

import { getSupabaseAdminClient, adaptiveUpsertAdminUser } from "@/lib/supabase/admin";

/** Verify the current request belongs to an admin_users user with role & permissions. */
export async function verifyAdminUser(
    request: Request,
): Promise<VerifiedAdmin | null> {
    const bundle = getSupabaseServerClient(request);
    let user: User | null = null;

    // 1. Try to authenticate via Authorization: Bearer <token>
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
        const token = authHeader.slice(7).trim();
        if (token) {
            try {
                const { data: tokenData } = await bundle.client.auth.getUser(token);
                user = tokenData?.user ?? null;
            } catch {
                // Ignore token error
            }
        }
    }

    // 2. Fallback to cookies
    if (!user) {
        try {
            const { data: cookieData } = await bundle.client.auth.getUser();
            user = cookieData?.user ?? null;
        } catch {
            // Ignore cookie error
        }
    }

    // 3. Admin client token verification fallback
    if (!user && authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
        try {
            const token = authHeader.slice(7).trim();
            const admin = getSupabaseAdminClient();
            const { data: adminTokenData } = await admin.auth.getUser(token);
            user = adminTokenData?.user ?? null;
        } catch {
            // Ignore admin error
        }
    }

    if (!user || !user.email) return null;

    const userEmail = user.email.toLowerCase().trim();
    let adminRow: Record<string, any> | null = null;

    // Query admin_users with select("*") so missing schema columns never cause failure
    try {
        const admin = getSupabaseAdminClient();
        const { data: serviceRow } = await admin
            .from("admin_users")
            .select("*")
            .or(`id.eq.${user.id},email.eq.${userEmail}`)
            .maybeSingle();

        if (serviceRow) {
            adminRow = serviceRow;
        }
    } catch {
        // Ignore admin client query errors
    }

    if (!adminRow) {
        try {
            const { data: sessionRow } = await bundle.client
                .from("admin_users")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            if (sessionRow) {
                adminRow = sessionRow;
            }
        } catch {
            // Ignore session client query errors
        }
    }

    // Auto-provision primary owner codestartersai@gmail.com if missing
    if (!adminRow && userEmail === "codestartersai@gmail.com") {
        try {
            const admin = getSupabaseAdminClient();
            const ownerRecord = {
                id: user.id,
                email: user.email,
                name: (user.user_metadata?.full_name as string) || "codestartersai",
                role: "super_admin",
                permissions: ["all"],
            };
            await adaptiveUpsertAdminUser(admin, ownerRecord);
            adminRow = ownerRecord;
        } catch (autoErr) {
            console.warn("Auto-provisioning owner error:", autoErr);
        }
    }

    if (!adminRow) return null;

    const role = (adminRow.role as AdminRole) || "super_admin";
    const permissions: AdminPermission[] = Array.isArray(adminRow.permissions)
        ? (adminRow.permissions as AdminPermission[])
        : (["all"] as AdminPermission[]);

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
