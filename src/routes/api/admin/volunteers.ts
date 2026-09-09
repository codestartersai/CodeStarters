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
          subject?: string;
          message?: string;
          newStatus?: string;
        };

        if (body.action === "reply") {
          const { volunteerId, to, name, subject, message } = body;
          if (!to || !subject || !message) {
            return jsonWithCookies(verified.bundle, { error: "Recipient, subject, and message are required." }, { status: 400 });
          }

          if (!isEmailConfigured()) {
            return jsonWithCookies(verified.bundle, { error: "Gmail connector is not configured." }, { status: 503 });
          }

          try {
            await sendPlainEmail({
              to: to.trim(),
              subject: subject.trim(),
              text: `Hi ${name || "there"},\n\n${message}\n\nBest regards,\nCodeStarters Team\ncodestarters26@gmail.com`,
              html: `
              <div style="font-family: -apple-system, sans-serif; padding: 28px; background: #f8fafc; color: #0f172a; max-width: 560px; margin: 0 auto; border-radius: 20px; border: 1px solid #e2e8f0;">
                <h2 style="margin-top: 0; color: #1e293b;">CodeStarters Application Update</h2>
                <p style="font-size: 15px; line-height: 1.6; color: #334155;">Hi ${name || "there"},</p>
                <div style="font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-wrap; margin: 20px 0;">${message.replace(/\n/g, "<br/>")}</div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="font-size: 12px; color: #94a3b8; margin: 0;">CodeStarters Cupertino &bull; Empowering Youth in Computer Science</p>
              </div>
              `,
              gmailFrom: "CodeStarters",
            });

            if (volunteerId && body.newStatus && VOLUNTEER_STATUSES.has(body.newStatus)) {
              const admin = getSupabaseAdminClient();
              await admin.from("volunteers").update({ status: body.newStatus }).eq("id", volunteerId);
            }

            return jsonWithCookies(verified.bundle, { ok: true, message: `Email sent to ${to}` });
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
