import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AdminRole, AdminPermission } from "@/lib/admin-auth";

export const Route = createFileRoute("/api/admin/auth-verify")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const bundle = getSupabaseServerClient(request);
                const { data: { user } } = await bundle.client.auth.getUser();

                if (!user || !user.email) {
                    return jsonWithCookies(bundle, { authorized: false, error: "Not logged in with Google." }, { status: 401 });
                }

                const admin = getSupabaseAdminClient();
                const userEmail = user.email.toLowerCase().trim();
                const userName = (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || userEmail.split("@")[0];
                const avatarUrl = (user.user_metadata?.avatar_url as string) || null;

                const body = await request.json().catch(() => ({})) as { inviteToken?: string };
                const inviteToken = body.inviteToken?.trim();

                try {
                    // 1. Check if user is already an admin
                    const { data: existingAdmin, error: lookupError } = await admin
                        .from("admin_users")
                        .select("id, email, name, avatar_url, role, permissions")
                        .eq("id", user.id)
                        .maybeSingle();

                    if (existingAdmin) {
                        return jsonWithCookies(bundle, {
                            authorized: true,
                            isFirstUser: false,
                            admin: existingAdmin,
                        });
                    }

                    // 2. Check total admin count for First-User Super Admin rule
                    const { count, error: countError } = await admin
                        .from("admin_users")
                        .select("*", { count: "exact", head: true });

                    const isFirstUser = (count === 0 || count === null) && !countError;

                    if (isFirstUser) {
                        // First person to log in becomes Super Admin!
                        const newAdmin = {
                            id: user.id,
                            email: userEmail,
                            name: userName,
                            avatar_url: avatarUrl,
                            role: "super_admin" as AdminRole,
                            permissions: ["all"] as AdminPermission[],
                        };

                        const { error: insertError } = await admin
                            .from("admin_users")
                            .insert(newAdmin);

                        if (insertError) {
                            return jsonWithCookies(bundle, { authorized: false, error: insertError.message }, { status: 500 });
                        }

                        return jsonWithCookies(bundle, {
                            authorized: true,
                            isFirstUser: true,
                            admin: newAdmin,
                            message: "Welcome! As the first person to log in, you have been designated Super Admin.",
                        });
                    }

                    // 3. Check for valid invitation
                    let inviteQuery = admin
                        .from("admin_invites")
                        .select("*")
                        .eq("email", userEmail)
                        .eq("used", false);

                    if (inviteToken) {
                        inviteQuery = inviteQuery.eq("token", inviteToken);
                    }

                    const { data: invite, error: inviteErr } = await inviteQuery.maybeSingle();

                    if (!invite || inviteErr) {
                        // User is neither existing admin nor invited
                        return jsonWithCookies(bundle, {
                            authorized: false,
                            error: "Access Denied: Your Google account has not been invited to access the CodeStarters Admin Dashboard. Please contact an administrator for an invitation.",
                        }, { status: 403 });
                    }

                    // Check expiration
                    if (new Date(invite.expires_at) < new Date()) {
                        return jsonWithCookies(bundle, {
                            authorized: false,
                            error: "This invitation has expired. Please ask an administrator to send a new invitation.",
                        }, { status: 403 });
                    }

                    // 4. Redeem the invitation & provision the admin user
                    const role = (invite.role as AdminRole) || "editor";
                    const permissions = Array.isArray(invite.permissions)
                        ? (invite.permissions as AdminPermission[])
                        : ["manage_team", "manage_requests"];

                    const newAdmin = {
                        id: user.id,
                        email: userEmail,
                        name: userName,
                        avatar_url: avatarUrl,
                        role,
                        permissions,
                    };

                    const { error: insertAdminErr } = await admin
                        .from("admin_users")
                        .insert(newAdmin);

                    if (insertAdminErr) {
                        return jsonWithCookies(bundle, { authorized: false, error: insertAdminErr.message }, { status: 500 });
                    }

                    // Mark invite as used (single use)
                    await admin
                        .from("admin_invites")
                        .update({ used: true })
                        .eq("id", invite.id);

                    return jsonWithCookies(bundle, {
                        authorized: true,
                        isFirstUser: false,
                        admin: newAdmin,
                        message: "Invitation verified successfully! Welcome to the CodeStarters team.",
                    });
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : "Authentication verification error.";
                    return jsonWithCookies(bundle, { authorized: false, error: message }, { status: 500 });
                }
            },
        },
    },
});
