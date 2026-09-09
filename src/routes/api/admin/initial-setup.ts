import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies } from "@/lib/supabase/server";
import { getSupabaseAdminClient, isServiceRoleConfigured, adaptiveUpsertAdminUser } from "@/lib/supabase/admin";
import { extractErrorMessage } from "@/lib/error-utils";
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
                        return jsonWithCookies(bundle, { setupRequired: false, error: extractErrorMessage(error) }, { status: 500 });
                    }

                    return jsonWithCookies(bundle, {
                        setupRequired: count === 0 || count === null,
                    });
                } catch (err: unknown) {
                    const message = extractErrorMessage(err, "Failed to query setup status.");
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
                    // Strictly check current admin count
                    const { count, error: countErr } = await admin
                        .from("admin_users")
                        .select("*", { count: "exact", head: true });

                    if (countErr) {
                        return jsonWithCookies(bundle, { ok: false, error: extractErrorMessage(countErr) }, { status: 500 });
                    }

                    if (count && count > 0) {
                        // Allow primary owner or existing super admin to reset credentials
                        const isPrimaryAdmin = email === "codestartersai@gmail.com";
                        const { data: superAdmins } = await admin
                            .from("admin_users")
                            .select("email, role")
                            .eq("role", "super_admin");

                        const matchesSuperAdmin = superAdmins?.some((a) => a.email?.toLowerCase() === email);

                        if (!isPrimaryAdmin && !matchesSuperAdmin) {
                            return jsonWithCookies(bundle, {
                                ok: false,
                                error: "Initial setup has already been completed. Registration is permanently locked. Please sign in or use an invitation link.",
                            }, { status: 403 });
                        }
                    }

                    // 1. Obtain or create the auth user in Supabase
                    let userId: string | null = null;
                    const hasServiceRole = isServiceRoleConfigured();

                    if (hasServiceRole) {
                        try {
                            const { data: userList } = await admin.auth.admin.listUsers();
                            const existingAuth = userList?.users?.find((u) => u.email?.toLowerCase() === email);

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

                                if (createAuthErr) {
                                    const errMsg = extractErrorMessage(createAuthErr).toLowerCase();
                                    if (errMsg.includes("already") || errMsg.includes("registered") || errMsg.includes("exists")) {
                                        // Attempt to sign in to obtain id
                                        const { data: signInData } = await bundle.client.auth.signInWithPassword({ email, password });
                                        if (signInData?.user) {
                                            userId = signInData.user.id;
                                        }
                                    } else {
                                        throw createAuthErr;
                                    }
                                } else if (newUser?.user) {
                                    userId = newUser.user.id;
                                }
                            }
                        } catch (adminAuthErr: unknown) {
                            console.warn("Service role auth creation failed, attempting client fallback:", adminAuthErr);
                            userId = null;
                        }
                    }

                    // Fallback to client auth if service role was absent or failed
                    if (!userId) {
                        const { data: signUpData, error: signUpErr } = await bundle.client.auth.signUp({
                            email,
                            password,
                            options: {
                                data: { full_name: username || email.split("@")[0] },
                            },
                        });

                        if (signUpData?.user) {
                            userId = signUpData.user.id;
                        } else if (signUpErr) {
                            const errMsg = extractErrorMessage(signUpErr).toLowerCase();
                            if (errMsg.includes("already") || errMsg.includes("registered") || errMsg.includes("exists")) {
                                const { data: signInData, error: signInErr } = await bundle.client.auth.signInWithPassword({
                                    email,
                                    password,
                                });
                                if (signInData?.user) {
                                    userId = signInData.user.id;
                                } else {
                                    throw new Error(`An account with ${email} already exists in Supabase. Please use your existing password, or delete the user in Supabase Auth.`);
                                }
                            } else {
                                throw signUpErr;
                            }
                        }
                    }

                    if (!userId) {
                        throw new Error("Unable to create or verify user in Supabase Auth.");
                    }

                    // 2. Insert Super Admin record into admin_users table
                    const newAdmin = {
                        id: userId,
                        email,
                        name: username || email.split("@")[0],
                        role: "super_admin" as AdminRole,
                        permissions: ["all"] as AdminPermission[],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };

                    let { error: insertErr } = await adaptiveUpsertAdminUser(admin, newAdmin);

                    if (insertErr) {
                        // If admin client upsert failed (e.g. RLS with anon key), try bundle client
                        const { error: clientInsertErr } = await adaptiveUpsertAdminUser(bundle.client, newAdmin);

                        if (!clientInsertErr) {
                            insertErr = null;
                        } else {
                            console.error("Failed to insert super admin record:", insertErr, clientInsertErr);
                            throw new Error(`Database error saving admin profile: ${extractErrorMessage(insertErr)}`);
                        }
                    }

                    return jsonWithCookies(bundle, {
                        ok: true,
                        email,
                        username: newAdmin.name,
                        message: "Super Admin account created successfully! You can now access the dashboard.",
                    });
                } catch (err: unknown) {
                    console.error("Super admin setup error:", err);
                    const message = extractErrorMessage(err, "Failed to initialize super admin.");
                    return jsonWithCookies(bundle, { ok: false, error: message }, { status: 500 });
                }
            },
        },
    },
});
