import type { IncomingMessage, ServerResponse } from "node:http";
import {
  getAdminClient,
  getAdminEnv,
  getRequestUrl,
  json,
  readJson,
  verifyAdmin,
} from "./admin-utils";
import { attachResumeUrls } from "../lib/volunteer-resumes";
import { sendApplicantEmail, isEmailConfigured } from "../lib/server-email";

const VOLUNTEER_STATUSES = new Set(["pending", "contacted", "rejected", "completed"]);

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET" && req.method !== "PATCH" && req.method !== "POST")
    return json(res, 405, { error: "Method not allowed" });
  try {
    const env = getAdminEnv();
    const isAdmin = await verifyAdmin(req, env);
    if (!isAdmin) return json(res, 401, { error: "Unauthorized" });

    const admin = getAdminClient(env);
    if (req.method === "GET") {
      const scope = getRequestUrl(req).searchParams.get("scope");
      if (scope !== "applications" && scope !== "team") {
        return json(res, 400, { error: "Invalid scope. Use applications or team." });
      }

      let query = admin.from("volunteers").select("*").order("created_at", { ascending: false });
      query =
        scope === "applications"
          ? query.neq("status", "completed").not("interest", "like", "Summer Program:%")
          : query.eq("status", "completed").not("interest", "like", "Summer Program:%");
      const { data, error } = await query;
      if (error) return json(res, 500, { error: error.message });
      const withResumes = await attachResumeUrls(admin, data ?? []);
      return json(res, 200, withResumes);
    }

    if (req.method === "POST") {
      const body: Record<string, any> = await readJson(req).catch(() => ({}));
      if (body.action === "reply") {
        const { volunteerId, to, name, interest, subject, message, callToActionText, callToActionUrl, newStatus } = body;
        if (!to || !subject || !message) {
          return json(res, 400, { error: "Recipient, subject, and message are required." });
        }

        if (!isEmailConfigured()) {
          return json(res, 503, { error: "Gmail connector is not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in settings." });
        }

        try {
          await sendApplicantEmail({
            to: String(to).trim(),
            applicantName: name ? String(name).trim() : "there",
            interest: interest ? String(interest).trim() : undefined,
            subject: String(subject).trim(),
            message: String(message).trim(),
            senderName: "The CodeStarters Team",
            callToActionText: callToActionText ? String(callToActionText).trim() : undefined,
            callToActionUrl: callToActionUrl ? String(callToActionUrl).trim() : undefined,
          });

          if (volunteerId) {
            const statusToSet = newStatus && VOLUNTEER_STATUSES.has(newStatus) ? newStatus : "contacted";
            await admin.from("volunteers").update({
              status: statusToSet,
              updated_at: new Date().toISOString(),
            }).eq("id", volunteerId);
          }

          return json(res, 200, {
            ok: true,
            message: `Email delivered to ${to} via Gmail connector!`,
          });
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : "Failed to send email.";
          return json(res, 500, { ok: false, error: errorMsg });
        }
      }

      return json(res, 400, { error: "Invalid action." });
    }

    const body: Record<string, any> = await readJson(req).catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "";
    if (!id || !VOLUNTEER_STATUSES.has(status)) {
      return json(res, 400, { error: "Invalid id or status." });
    }

    const { error } = await admin.from("volunteers").update({ status }).eq("id", id);
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error("Admin volunteers function error:", error);
    return json(res, 500, { error: "Could not load volunteers." });
  }
}
