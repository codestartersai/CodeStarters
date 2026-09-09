import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminUser, jsonWithCookies, getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasPermission } from "@/lib/admin-auth";
import { sendRequestReplyEmail, isEmailConfigured } from "@/lib/server-email";

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

            POST: async ({ request }) => {
                const verified = await verifyAdminUser(request);
                if (!verified) {
                    const bundle = getSupabaseServerClient(request);
                    return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
                }

                if (!hasPermission(verified.permissions, "manage_requests")) {
                    return jsonWithCookies(verified.bundle, { error: "Permission denied." }, { status: 403 });
                }

                const body = await request.json().catch(() => ({})) as {
                    action?: "reply";
                    requestId?: string;
                    to?: string;
                    recipientName?: string;
                    businessName?: string;
                    subject?: string;
                    message?: string;
                    updateStatus?: boolean;
                    callToActionText?: string;
                    callToActionUrl?: string;
                };

                if (body.action === "reply") {
                    const { requestId, to, recipientName, businessName, subject, message } = body;
                    if (!to || !subject || !message) {
                        return jsonWithCookies(verified.bundle, { error: "Recipient email, subject, and message are required." }, { status: 400 });
                    }

                    if (!isEmailConfigured()) {
                        return jsonWithCookies(verified.bundle, {
                            error: "Gmail connector is not configured. Please add GMAIL_USER and GMAIL_APP_PASSWORD in settings.",
                        }, { status: 503 });
                    }

                    try {
                        const senderName = (verified.user.user_metadata?.full_name as string) ||
                            (verified.user.user_metadata?.name as string) ||
                            "The CodeStarters Team";

                        await sendRequestReplyEmail({
                            to: to.trim(),
                            recipientName: recipientName?.trim() || "there",
                            businessName: businessName?.trim(),
                            subject: subject.trim(),
                            message: message.trim(),
                            senderName,
                            callToActionText: body.callToActionText?.trim() || undefined,
                            callToActionUrl: body.callToActionUrl?.trim() || undefined,
                        });

                        // If requestId is provided, update status to contacted and record note
                        if (requestId) {
                            const admin = getSupabaseAdminClient();
                            const { data: existingReq } = await admin
                                .from("website_requests")
                                .select("notes, status")
                                .eq("id", requestId)
                                .maybeSingle();

                            const nowFormatted = new Date().toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            });
                            const replyLog = `[Email Sent ${nowFormatted} by ${verified.user.email}]: "${subject.trim()}"`;
                            const updatedNotes = existingReq?.notes ? `${existingReq.notes}\n${replyLog}` : replyLog;

                            await admin
                                .from("website_requests")
                                .update({
                                    status: body.updateStatus !== false ? "contacted" : (existingReq?.status || "contacted"),
                                    notes: updatedNotes,
                                    updated_at: new Date().toISOString(),
                                })
                                .eq("id", requestId);
                        }

                        return jsonWithCookies(verified.bundle, {
                            ok: true,
                            message: `Email successfully delivered to ${to} via Gmail connector!`,
                        });
                    } catch (err: unknown) {
                        const errorMsg = err instanceof Error ? err.message : "Failed to send email reply.";
                        return jsonWithCookies(verified.bundle, { ok: false, error: errorMsg }, { status: 500 });
                    }
                }

                return jsonWithCookies(verified.bundle, { error: "Invalid action." }, { status: 400 });
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
