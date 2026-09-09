import { createFileRoute } from "@tanstack/react-router";
import crypto from "node:crypto";
import { verifyAdminUser, jsonWithCookies, getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { emailNotConfiguredMessage, isEmailConfigured, sendPlainEmail } from "@/lib/server-email";

function generatePassword() {
  return crypto.randomBytes(12).toString("base64url");
}

export const Route = createFileRoute("/api/admin/firehacks/provision-member")({
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
          .from("firehacks_members")
          .select("id, email, created_at")
          .order("created_at", { ascending: false });

        if (error)
          return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
        return jsonWithCookies(verified.bundle, data);
      },
      POST: async ({ request }) => {
        const verified = await verifyAdminUser(request);
        if (!verified) {
          const bundle = getSupabaseServerClient(request);
          return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
        }

        if (!isEmailConfigured()) {
          return jsonWithCookies(
            verified.bundle,
            { error: emailNotConfiguredMessage() },
            { status: 500 },
          );
        }

        const body = await request.json().catch(() => ({}));
        const email: string = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        if (!email)
          return jsonWithCookies(verified.bundle, { error: "email is required" }, { status: 400 });

        const admin = getSupabaseAdminClient();
        const password = generatePassword();

        let authUserId: string;
        const { data: created, error: createError } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (createError) {
          if (!createError.message.toLowerCase().includes("already")) {
            return jsonWithCookies(
              verified.bundle,
              { error: "Failed to create account." },
              { status: 500 },
            );
          }
          const { data: list } = await admin.auth.admin.listUsers();
          const existing = list?.users?.find((u) => u.email?.toLowerCase() === email);
          if (!existing)
            return jsonWithCookies(
              verified.bundle,
              { error: "Could not locate existing account." },
              { status: 500 },
            );
          authUserId = existing.id;
          const { error: updateError } = await admin.auth.admin.updateUserById(authUserId, {
            password,
          });
          if (updateError)
            return jsonWithCookies(
              verified.bundle,
              { error: "Failed to reset password." },
              { status: 500 },
            );
        } else {
          authUserId = created.user.id;
        }

        await admin
          .from("firehacks_members")
          .upsert({ id: authUserId, email, created_by: verified.user.id }, { onConflict: "id" });

        const scannerUrl = `${process.env.PUBLIC_SITE_URL ?? "https://codestarters.org"}/firehacks/member/login`;
        try {
          await sendPlainEmail({
            to: email,
            subject: "Your Fire Hacks Staff Scanner Access",
            text: [
              "You've been added as a Fire Hacks 2026 staff member.",
              "",
              "Use the link and credentials below to access the food scanner:",
              "",
              `  Scanner: ${scannerUrl}`,
              `  Email:   ${email}`,
              `  Password: ${password}`,
              "",
              "Do not share these credentials. Contact a Fire Hacks organizer if you have any issues.",
              "",
              "— Fire Hacks 2026 Organizers",
            ].join("\n"),
          });
        } catch (mailError: unknown) {
          console.error("Mail send error:", mailError);
          const msg = mailError instanceof Error ? mailError.message : "";
          if (msg === "MISSING_EMAIL_CONFIG") {
            return jsonWithCookies(
              verified.bundle,
              { error: emailNotConfiguredMessage() },
              { status: 500 },
            );
          }
          return jsonWithCookies(
            verified.bundle,
            { error: "Account created but email failed to send." },
            { status: 500 },
          );
        }

        return jsonWithCookies(verified.bundle, { ok: true, email });
      },
      DELETE: async ({ request }) => {
        const verified = await verifyAdminUser(request);
        if (!verified) {
          const bundle = getSupabaseServerClient(request);
          return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
        }

        const { memberId } = await request.json().catch(() => ({}));
        if (!memberId)
          return jsonWithCookies(
            verified.bundle,
            { error: "memberId is required" },
            { status: 400 },
          );

        const admin = getSupabaseAdminClient();
        const { error } = await admin.auth.admin.deleteUser(memberId);
        if (error)
          return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });

        return jsonWithCookies(verified.bundle, { ok: true });
      },
    },
  },
});
