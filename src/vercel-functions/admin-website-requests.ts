import type { IncomingMessage, ServerResponse } from "node:http";
import { getAdminClient, getAdminEnv, json, readJson, verifyAdmin } from "./admin-utils";
import { sendRequestReplyEmail, isEmailConfigured } from "../lib/server-email";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET" && req.method !== "PATCH" && req.method !== "POST")
    return json(res, 405, { error: "Method not allowed" });
  try {
    const env = getAdminEnv();
    const isAdmin = await verifyAdmin(req, env);
    if (!isAdmin) return json(res, 401, { error: "Unauthorized" });

    const admin = getAdminClient(env);
    if (req.method === "GET") {
      const { data, error } = await admin
        .from("website_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, data ?? []);
    }

    if (req.method === "POST") {
      const body: Record<string, any> = await readJson(req).catch(() => ({}));
      if (body.action === "reply") {
        const { requestId, to, recipientName, businessName, subject, message, callToActionText, callToActionUrl, updateStatus } = body;
        if (!to || !subject || !message) {
          return json(res, 400, { error: "Recipient email, subject, and message are required." });
        }

        if (!isEmailConfigured()) {
          return json(res, 503, { error: "Gmail connector is not configured. Please add GMAIL_USER and GMAIL_APP_PASSWORD in settings." });
        }

        try {
          await sendRequestReplyEmail({
            to: String(to).trim(),
            recipientName: recipientName ? String(recipientName).trim() : "there",
            businessName: businessName ? String(businessName).trim() : undefined,
            subject: String(subject).trim(),
            message: String(message).trim(),
            senderName: "The CodeStarters Team",
            callToActionText: callToActionText ? String(callToActionText).trim() : undefined,
            callToActionUrl: callToActionUrl ? String(callToActionUrl).trim() : undefined,
          });

          if (requestId) {
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
            const replyLog = `[Email Sent ${nowFormatted}]: "${String(subject).trim()}"`;
            const updatedNotes = existingReq?.notes ? `${existingReq.notes}\n${replyLog}` : replyLog;

            await admin
              .from("website_requests")
              .update({
                status: updateStatus !== false ? "contacted" : (existingReq?.status || "contacted"),
                notes: updatedNotes,
                updated_at: new Date().toISOString(),
              })
              .eq("id", requestId);
          }

          return json(res, 200, {
            ok: true,
            message: `Email successfully delivered to ${to} via Gmail connector!`,
          });
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : "Failed to send email reply.";
          return json(res, 500, { ok: false, error: errorMsg });
        }
      }

      return json(res, 400, { error: "Invalid action." });
    }

    const body: Record<string, any> = await readJson(req).catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "";
    if (!id || !status) return json(res, 400, { error: "Invalid id or status." });

    const { error } = await admin.from("website_requests").update({ status }).eq("id", id);
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error("Admin website requests function error:", error);
    return json(res, 500, { error: "Could not load website requests." });
  }
}
