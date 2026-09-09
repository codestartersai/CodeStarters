import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AdminRole, AdminPermission } from "@/lib/admin-auth";

export const Route = createFileRoute("/api/admin/initial-setup")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const bundle = getSupabaseServerClient(request);
                const admin = getSupabaseAdminClient();

                try {
                    const { count, error } = await admin
                        .from("admin_users")
                        .select("*", { count: "exact", head: true });

                    if (error) {
                        return jsonWithCookies(bundle, { setupRequired: false, error: error.message }, { status: 500 });
                    }

                    return jsonWithCookies(bundle, {
                        setupRequired: count === 0 || count === null,
                    });
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : "Failed to query setup status.";
                    return jsonWithCookies(bundle, { setupRequired: false, error: message }, { status: 500 });
                }
            },

            POST: async ({ request }) => {
                const bundle = getSupabaseServerClient(request);
                const admin = getSupabaseAdminClient();

                const body = await request.json().catch(() => ({})) as {
                    username?: string;
                    email?: string;
                    password?: string;
                };

                const username = body.username?.trim() || "";
                const email = body.email?.toLowerCase().trim() || "";
                const password = body.password?.trim() || "";

                if (!email || !email.includes("@")) {
                    return jsonWithCookies(bundle, { ok: false, error: "A valid email address is required." }, { status: 400 });
                }

                if (!password || password.length < 6) {
                    return jsonWithCookies(bundle, { ok: false, error: "Password must be at least 6 characters long." }, { status: 400 });
                }

                try {
                    // Strictly ensure no admin exists yet
                    const { count, error: countErr } = await admin
                        .from("admin_users")
                        .select("*", { count: "exact", head: true });

                    if (countErr) {
                        return jsonWithCookies(bundle, { ok: false, error: countErr.message }, { status: 500 });
                    }

                    if (count && count > 0) {
                        // Allow primary owner (codestartersai@gmail.com) or existing super admin to set/reset their password
                        const isPrimaryAdmin = email === "codestartersai@gmail.com";
                        const { data: superAdmins } = await admin
                            .from("admin_users")
                            .select("email, role")
                            .eq("role", "super_admin");

                        const matchesSuperAdmin = superAdmins?.some((a) => a.email.toLowerCase() === email);

                        if (!isPrimaryAdmin && !matchesSuperAdmin) {
                            return jsonWithCookies(bundle, {
                                ok: false,
                                error: "Initial setup has already been completed. Registration is permanently locked. Please sign in or use an invitation link.",
                            }, { status: 403 });
                        }
                    }

                    // Look up if user already exists in auth.users
                    const { data: userList } = await admin.auth.admin.listUsers();
                    const existingAuth = userList?.users?.find((u) => u.email?.toLowerCase() === email);

                    let userId: string;

                    if (existingAuth) {
                        userId = existingAuth.id;
                        await admin.auth.admin.updateUserById(userId, {
                            password,
                            email_confirm: true,
                            user_metadata: { full_name: username || email.split("@")[0] },
                        });
                    } else {
                        const { data: newUser, error: createAuthErr } = await admin.auth.admin.createUser({
                            email,
                            password,
                            email_confirm: true,
                            user_metadata: { full_name: username || email.split("@")[0] },
                        });

                        if (createAuthErr || !newUser.user) {
                            throw createAuthErr || new Error("Failed to create Supabase auth user.");
                        }
                        userId = newUser.user.id;
                    }

                    // Insert as Super Admin
                    const newAdmin = {
                        id: userId,
                        email,
                        name: username || email.split("@")[0],
                        role: "super_admin" as AdminRole,
                        permissions: ["all"] as AdminPermission[],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };

                    const { error: insertErr } = await admin
                        .from("admin_users")
                        .upsert(newAdmin);

                    if (insertErr) {
                        throw insertErr;
                    }

                    return jsonWithCookies(bundle, {
                        ok: true,
                        email,
                        username: newAdmin.name,
                        message: "Super Admin account created successfully! You can now access the dashboard.",
                    });
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : "Failed to initialize super admin.";
                    return jsonWithCookies(bundle, { ok: false, error: message }, { status: 500 });
                }
            },
        },
    },
});
