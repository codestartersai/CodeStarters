import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient, jsonWithCookies } from "@/lib/supabase/server";
import type { AdminRole, AdminPermission } from "@/lib/admin-auth";

export const Route = createFileRoute("/api/admin/redeem-invite")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const bundle = getSupabaseServerClient(request);
                const url = new URL(request.url);
                const token = url.searchParams.get("token")?.trim();

                if (!token) {
                    return jsonWithCookies(bundle, { valid: false, error: "Missing invitation token." }, { status: 400 });
                }

                const admin = getSupabaseAdminClient();
                const { data: invite, error } = await admin
                    .from("admin_invites")
                    .select("id, email, role, permissions, used, expires_at, invited_by")
                    .eq("token", token)
                    .maybeSingle();

                if (error || !invite) {
                    return jsonWithCookies(bundle, { valid: false, error: "Invalid or nonexistent invitation token." }, { status: 404 });
                }

                if (invite.used) {
                    return jsonWithCookies(bundle, { valid: false, error: "This invitation link has already been used." }, { status: 400 });
                }

                if (new Date(invite.expires_at) < new Date()) {
                    return jsonWithCookies(bundle, { valid: false, error: "This invitation link has expired." }, { status: 400 });
                }

                return jsonWithCookies(bundle, {
                    valid: true,
                    email: invite.email,
                    role: invite.role,
                    permissions: invite.permissions,
                    invited_by: invite.invited_by,
                });
            },

            POST: async ({ request }) => {
                const bundle = getSupabaseServerClient(request);
                const body = await request.json().catch(() => ({})) as {
                    token?: string;
                    password?: string;
                    name?: string;
                };

                const token = body.token?.trim();
                const password = body.password?.trim();
                const name = body.name?.trim();

                if (!token) {
                    return jsonWithCookies(bundle, { ok: false, error: "Missing invite token." }, { status: 400 });
                }

                const admin = getSupabaseAdminClient();

                // 1. Verify token
                const { data: invite, error: lookupErr } = await admin
                    .from("admin_invites")
                    .select("*")
                    .eq("token", token)
                    .maybeSingle();

                if (lookupErr || !invite) {
                    return jsonWithCookies(bundle, { ok: false, error: "Invalid invitation token." }, { status: 404 });
                }

                if (invite.used) {
                    return jsonWithCookies(bundle, { ok: false, error: "This invitation has already been redeemed." }, { status: 400 });
                }

                if (new Date(invite.expires_at) < new Date()) {
                    return jsonWithCookies(bundle, { ok: false, error: "This invitation has expired." }, { status: 400 });
                }

                const email = invite.email.toLowerCase().trim();
                const role = (invite.role as AdminRole) || "editor";
                const permissions = Array.isArray(invite.permissions)
                    ? (invite.permissions as AdminPermission[])
                    : ["manage_team", "manage_requests"];

                try {
                    if (!password || password.length < 6) {
                        return jsonWithCookies(bundle, { ok: false, error: "Password must be at least 6 characters." }, { status: 400 });
                    }

                    const displayName = name?.trim() || email.split("@")[0];

                    // Check if user already exists in Supabase Auth
                    const { data: existingUserList } = await admin.auth.admin.listUsers();
                    const existingAuth = existingUserList?.users?.find((u) => u.email?.toLowerCase() === email);

                    let userId: string;

                    if (existingAuth) {
                        userId = existingAuth.id;
                        // Update password and confirm email
                        const { error: updateAuthErr } = await admin.auth.admin.updateUserById(userId, {
                            password,
                            email_confirm: true,
                            user_metadata: { full_name: displayName },
                        });
                        if (updateAuthErr) throw updateAuthErr;
                    } else {
                        // Create new auth user
                        const { data: newUser, error: createAuthErr } = await admin.auth.admin.createUser({
                            email,
                            password,
                            email_confirm: true,
                            user_metadata: { full_name: displayName },
                        });
                        if (createAuthErr || !newUser.user) {
                            throw createAuthErr || new Error("Failed to create auth user.");
                        }
                        userId = newUser.user.id;
                    }

                    // 2. Upsert admin_users
                    const { error: adminUpsertErr } = await admin
                        .from("admin_users")
                        .upsert({
                            id: userId,
                            email,
                            name: displayName,
                            role,
                            permissions,
                            updated_at: new Date().toISOString(),
                        });

                    if (adminUpsertErr) {
                        throw adminUpsertErr;
                    }

                    // 3. Mark invite as used (single-use)
                    await admin
                        .from("admin_invites")
                        .update({ used: true })
                        .eq("id", invite.id);

                    return jsonWithCookies(bundle, {
                        ok: true,
                        email,
                        role,
                        permissions,
                        message: "Access granted! Your credentials have been saved.",
                    });
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : "Failed to redeem invitation.";
                    return jsonWithCookies(bundle, { ok: false, error: message }, { status: 500 });
                }
            },
        },
    },
});
