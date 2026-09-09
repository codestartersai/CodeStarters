import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminUser, jsonWithCookies, getSupabaseServerClient } from "@/lib/supabase/server";
import { testSmtpConnection, sendPlainEmail, isEmailConfigured } from "@/lib/server-email";

export const Route = createFileRoute("/api/admin/email-connector")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const verified = await verifyAdminUser(request);
                if (!verified) {
                    const bundle = getSupabaseServerClient(request);
                    return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
                }

                const configured = isEmailConfigured();
                if (!configured) {
                    return jsonWithCookies(verified.bundle, {
                        configured: false,
                        message: "GMAIL_USER or GMAIL_APP_PASSWORD is not configured in your environment.",
                    });
                }

                const test = await testSmtpConnection();
                return jsonWithCookies(verified.bundle, {
                    configured: test.ok,
                    user: test.user ? `${test.user.split("@")[0]}@...` : null,
                    error: test.error,
                });
            },

            POST: async ({ request }) => {
                const verified = await verifyAdminUser(request);
                if (!verified) {
                    const bundle = getSupabaseServerClient(request);
                    return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
                }

                const body = await request.json().catch(() => ({})) as { testTo?: string };
                const to = body.testTo?.trim() || verified.user.email;

                if (!to) {
                    return jsonWithCookies(verified.bundle, { error: "Recipient email required." }, { status: 400 });
                }

                try {
                    await sendPlainEmail({
                        to,
                        subject: "Test from CodeStarters Email Connector",
                        text: "Congratulations! Your Gmail account and app password are connected successfully to the CodeStarters Admin Portal.",
                        html: `
                        <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; border-radius: 16px;">
                            <h2 style="color: #1e293b;">Gmail Connector Verified!</h2>
                            <p style="color: #475569; font-size: 15px;">Your Google account is successfully sending transactional and invitation emails for the CodeStarters Admin Dashboard.</p>
                            <div style="padding: 12px 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; color: #065f46; font-weight: bold; font-size: 14px;">
                                Ready to invite administrators with one-use Google SSO links!
                            </div>
                        </div>
                        `,
                    });

                    return jsonWithCookies(verified.bundle, { ok: true, sentTo: to });
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : "Failed to send test email.";
                    return jsonWithCookies(verified.bundle, { ok: false, error: message }, { status: 500 });
                }
            },
        },
    },
});
