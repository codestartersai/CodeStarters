import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminUser, jsonWithCookies, getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { attachResumeUrls } from "@/lib/volunteer-resumes";
import { sendPlainEmail, isEmailConfigured } from "@/lib/server-email";
import { hasPermission } from "@/lib/admin-auth";

const VOLUNTEER_STATUSES = new Set(["pending", "contacted", "rejected", "completed"]);

export const Route = createFileRoute("/api/admin/volunteers")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const verified = await verifyAdminUser(request);
        if (!verified) {
          const bundle = getSupabaseServerClient(request);
          return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const scope = url.searchParams.get("scope");
        if (scope !== "applications" && scope !== "team") {
          return jsonWithCookies(
            verified.bundle,
            { error: "Invalid scope. Use applications or team." },
            { status: 400 },
          );
        }

        const admin = getSupabaseAdminClient();
        let q = admin.from("volunteers").select("*").order("created_at", { ascending: false });
        if (scope === "applications") {
          q = q.neq("status", "completed").not("interest", "like", "Summer Program:%");
        } else {
          q = q.eq("status", "completed").not("interest", "like", "Summer Program:%");
        }

        const { data, error } = await q;
        if (error) {
          return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
        }
        const withResumes = await attachResumeUrls(admin, data ?? []);
        return jsonWithCookies(verified.bundle, withResumes);
      },

      POST: async ({ request }) => {
        const verified = await verifyAdminUser(request);
        if (!verified) {
          const bundle = getSupabaseServerClient(request);
          return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
        }

        if (!hasPermission(verified.permissions, "manage_applications")) {
          return jsonWithCookies(verified.bundle, { error: "Permission denied." }, { status: 403 });
        }

        const body = (await request.json().catch(() => ({}))) as {
          action?: "reply";
          volunteerId?: string;
          to?: string;
          name?: string;
          interest?: string;
          subject?: string;
          message?: string;
          callToActionText?: string;
          callToActionUrl?: string;
          newStatus?: string;
        };

        if (body.action === "reply") {
          const { volunteerId, to, name, interest, subject, message } = body;
          if (!to || !subject || !message) {
            return jsonWithCookies(verified.bundle, { error: "Recipient, subject, and message are required." }, { status: 400 });
          }

          if (!isEmailConfigured()) {
            return jsonWithCookies(verified.bundle, { error: "Gmail connector is not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in settings." }, { status: 503 });
          }

          try {
            const { sendApplicantEmail } = await import("@/lib/server-email");
            await sendApplicantEmail({
              to: to.trim(),
              applicantName: name?.trim() || "there",
              interest: interest?.trim(),
              subject: subject.trim(),
              message: message.trim(),
              senderName: verified.user.email ? `${verified.user.email} (CodeStarters)` : "The CodeStarters Team",
              callToActionText: body.callToActionText?.trim() || undefined,
              callToActionUrl: body.callToActionUrl?.trim() || undefined,
            });

            if (volunteerId) {
              const newStatus = body.newStatus && VOLUNTEER_STATUSES.has(body.newStatus) ? body.newStatus : "contacted";
              const admin = getSupabaseAdminClient();
              await admin.from("volunteers").update({
                status: newStatus,
                updated_at: new Date().toISOString(),
              }).eq("id", volunteerId);
            }

            return jsonWithCookies(verified.bundle, {
              ok: true,
              message: `Email delivered to ${to} via Gmail connector!`,
            });
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Failed to send email.";
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

        if (!hasPermission(verified.permissions, "manage_applications")) {
          return jsonWithCookies(verified.bundle, { error: "Permission denied." }, { status: 403 });
        }

        const body = (await request.json().catch(() => ({}))) as { id?: string; status?: string };
        const { id, status } = body;
        if (!id || typeof id !== "string" || !status || !VOLUNTEER_STATUSES.has(status)) {
          return jsonWithCookies(
            verified.bundle,
            { error: "Invalid id or status." },
            { status: 400 },
          );
        }

        const admin = getSupabaseAdminClient();
        const { error } = await admin.from("volunteers").update({ status }).eq("id", id);
        if (error) {
          return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
        }
        return jsonWithCookies(verified.bundle, { ok: true });
      },
    },
  },
});
