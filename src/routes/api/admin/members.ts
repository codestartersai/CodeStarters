import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminUser, jsonWithCookies, getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendAdminInviteEmail, isEmailConfigured } from "@/lib/server-email";
import { hasPermission, type AdminRole, type AdminPermission } from "@/lib/admin-auth";
import crypto from "crypto";

export interface MemoryInvite {
    id: string;
    email: string;
    role: AdminRole;
    permissions: AdminPermission[];
    token: string;
    used: boolean;
    invited_by: string | null;
    created_at: string;
    expires_at: string;
}

export const _memoryInvites: Record<string, MemoryInvite> = {};

export const Route = createFileRoute("/api/admin/members")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const verified = await verifyAdminUser(request);
                if (!verified) {
                    const bundle = getSupabaseServerClient(request);
                    return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
                }

                const admin = getSupabaseAdminClient();

                let dbMembers: any[] = [];
                let dbInvites: any[] = [];

                try {
                    const { data: members } = await admin.from("admin_users").select("*").order("created_at", { ascending: true });
                    if (members) dbMembers = members;
                } catch {}

                try {
                    const { data: invites } = await admin.from("admin_invites").select("*").eq("used", false).order("created_at", { ascending: false });
                    if (invites) dbInvites = invites;
                } catch {}

                // Merge with in-memory invites
                const activeMemoryInvites = Object.values(_memoryInvites).filter(
                    (inv) => !inv.used && new Date(inv.expires_at) > new Date()
                );

                const allInvites = [...dbInvites];
                for (const memInv of activeMemoryInvites) {
                    if (!allInvites.some((inv) => inv.token === memInv.token || inv.email === memInv.email)) {
                        allInvites.push(memInv);
                    }
                }

                return jsonWithCookies(verified.bundle, {
                    members: dbMembers,
                    invites: allInvites.filter((inv: { expires_at: string }) => new Date(inv.expires_at) > new Date()),
                    invitesTableMissing: false,
                    emailConfigured: isEmailConfigured(),
                    currentUserRole: verified.role,
                    currentUserPermissions: verified.permissions,
                });
            },

            POST: async ({ request }) => {
                const verified = await verifyAdminUser(request);
                if (!verified) {
                    const bundle = getSupabaseServerClient(request);
                    return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
                }

                if (!hasPermission(verified.permissions, "manage_admins") && verified.role !== "super_admin") {
                    return jsonWithCookies(verified.bundle, { error: "Permission denied. Only administrators can invite members." }, { status: 403 });
                }

                const body = await request.json().catch(() => ({})) as {
                    email?: string;
                    role?: AdminRole;
                    permissions?: AdminPermission[];
                };

                const email = body.email?.toLowerCase().trim();
                const role = body.role || "editor";
                const permissions = body.permissions || ["manage_team", "manage_requests"];

                if (!email || !email.includes("@")) {
                    return jsonWithCookies(verified.bundle, { error: "Valid email address is required." }, { status: 400 });
                }

                const admin = getSupabaseAdminClient();

                // Check if already an active admin
                try {
                    const { data: existingAdmin } = await admin
                        .from("admin_users")
                        .select("id, email")
                        .eq("email", email)
                        .maybeSingle();

                    if (existingAdmin) {
                        return jsonWithCookies(verified.bundle, { error: "This email is already an active administrator." }, { status: 400 });
                    }
                } catch {}

                // Invalidate any existing unused invites for this email
                try {
                    await admin.from("admin_invites").delete().eq("email", email);
                } catch {}

                for (const key of Object.keys(_memoryInvites)) {
                    if (_memoryInvites[key].email === email) {
                        delete _memoryInvites[key];
                    }
                }

                // Create cryptographic invite token
                const token = crypto.randomBytes(24).toString("hex");
                const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

                const inviteRecord: MemoryInvite = {
                    id: crypto.randomUUID(),
                    email,
                    role,
                    permissions,
                    token,
                    used: false,
                    invited_by: verified.user.email,
                    created_at: new Date().toISOString(),
                    expires_at: expiresAt,
                };

                // Store in memory always as guaranteed fallback
                _memoryInvites[token] = inviteRecord;

                // Also try inserting to Supabase admin_invites
                try {
                    await admin.from("admin_invites").insert(inviteRecord);
                } catch (dbErr) {
                    console.warn("DB insert for admin_invites bypassed to memory:", dbErr);
                }

                // Determine base URL for invite link
                const reqUrl = new URL(request.url);
                const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;
                const inviteUrl = `${baseUrl}/admin/login?invite=${token}`;

                let emailSent = false;
                let emailError: string | null = null;

                if (isEmailConfigured()) {
                    try {
                        await sendAdminInviteEmail({
                            to: email,
                            inviteUrl,
                            role,
                            permissions,
                            invitedByName: verified.user.email || "CodeStarters Admin",
                        });
                        emailSent = true;
                    } catch (err: unknown) {
                        emailError = err instanceof Error ? err.message : "Failed to send email via SMTP.";
                        console.error("Invite email failed to send:", err);
                    }
                }

                return jsonWithCookies(verified.bundle, {
                    ok: true,
                    token,
                    inviteUrl,
                    emailSent,
                    emailError,
                    message: emailSent
                        ? `Invitation sent successfully to ${email} via Gmail connector!`
                        : `Invite created for ${email}. Email connector not active; copy the invite link below.`,
                });
            },

            PATCH: async ({ request }) => {
                const verified = await verifyAdminUser(request);
                if (!verified) {
                    const bundle = getSupabaseServerClient(request);
                    return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
                }

                if (!hasPermission(verified.permissions, "manage_admins") && verified.role !== "super_admin") {
                    return jsonWithCookies(verified.bundle, { error: "Permission denied." }, { status: 403 });
                }

                const body = await request.json().catch(() => ({})) as {
                    id?: string;
                    role?: AdminRole;
                    permissions?: AdminPermission[];
                };

                if (!body.id) {
                    return jsonWithCookies(verified.bundle, { error: "Missing member ID." }, { status: 400 });
                }

                const admin = getSupabaseAdminClient();
                const updatePayload: Record<string, unknown> = {};
                if (body.role) updatePayload.role = body.role;
                if (body.permissions) updatePayload.permissions = body.permissions;

                const { error } = await admin
                    .from("admin_users")
                    .update(updatePayload)
                    .eq("id", body.id);

                if (error) {
                    return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
                }

                return jsonWithCookies(verified.bundle, { ok: true });
            },

            DELETE: async ({ request }) => {
                const verified = await verifyAdminUser(request);
                if (!verified) {
                    const bundle = getSupabaseServerClient(request);
                    return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
                }

                if (!hasPermission(verified.permissions, "manage_admins") && verified.role !== "super_admin") {
                    return jsonWithCookies(verified.bundle, { error: "Permission denied." }, { status: 403 });
                }

                const url = new URL(request.url);
                const memberId = url.searchParams.get("memberId");
                const inviteId = url.searchParams.get("inviteId");

                const admin = getSupabaseAdminClient();

                if (memberId) {
                    // Prevent deleting self
                    if (memberId === verified.user.id) {
                        return jsonWithCookies(verified.bundle, { error: "You cannot remove your own admin access." }, { status: 400 });
                    }

                    const { error } = await admin.from("admin_users").delete().eq("id", memberId);
                    if (error) {
                        return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
                    }
                    return jsonWithCookies(verified.bundle, { ok: true, removed: "member" });
                }

                if (inviteId) {
                    const { error } = await admin.from("admin_invites").delete().eq("id", inviteId);
                    if (error) {
                        if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
                            return jsonWithCookies(verified.bundle, { ok: true, removed: "invite" });
                        }
                        return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
                    }
                    return jsonWithCookies(verified.bundle, { ok: true, removed: "invite" });
                }

                return jsonWithCookies(verified.bundle, { error: "Provide memberId or inviteId." }, { status: 400 });
            },
        },
    },
});
