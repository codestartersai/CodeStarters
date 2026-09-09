import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminUser, jsonWithCookies, getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasPermission } from "@/lib/admin-auth";

export const Route = createFileRoute("/api/admin/website-requests")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const verified = await verifyAdminUser(request);
                if (!verified) {
                    const bundle = getSupabaseServerClient(request);
                    return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
                }

                const admin = getSupabaseAdminClient();
                const { data, error } = await admin
                    .from("website_requests")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) {
                    return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
                }
                return jsonWithCookies(verified.bundle, data ?? []);
            },

            PATCH: async ({ request }) => {
                const verified = await verifyAdminUser(request);
                if (!verified) {
                    const bundle = getSupabaseServerClient(request);
                    return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
                }

                if (!hasPermission(verified.permissions, "manage_requests")) {
                    return jsonWithCookies(verified.bundle, { error: "Permission denied." }, { status: 403 });
                }

                const body = await request.json().catch(() => ({})) as {
                    id?: string;
                    status?: string;
                    notes?: string;
                    assigned_to?: string;
                };

                const { id } = body;
                if (!id || typeof id !== "string") {
                    return jsonWithCookies(verified.bundle, { error: "Invalid id." }, { status: 400 });
                }

                const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
                if (typeof body.status === "string") updates.status = body.status;
                if (typeof body.notes === "string") updates.notes = body.notes;
                if (typeof body.assigned_to === "string") updates.assigned_to = body.assigned_to;

                const admin = getSupabaseAdminClient();
                const { error } = await admin.from("website_requests").update(updates).eq("id", id);
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

                if (!hasPermission(verified.permissions, "manage_requests")) {
                    return jsonWithCookies(verified.bundle, { error: "Permission denied." }, { status: 403 });
                }

                const url = new URL(request.url);
                const id = url.searchParams.get("id");
                if (!id) {
                    return jsonWithCookies(verified.bundle, { error: "Request ID required." }, { status: 400 });
                }

                const admin = getSupabaseAdminClient();
                const { error } = await admin.from("website_requests").delete().eq("id", id);
                if (error) {
                    return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
                }
                return jsonWithCookies(verified.bundle, { ok: true });
            },
        },
    },
});
