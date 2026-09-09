import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminUser, jsonWithCookies, getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { attachResumeUrls } from "@/lib/volunteer-resumes";

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
      PATCH: async ({ request }) => {
        const verified = await verifyAdminUser(request);
        if (!verified) {
          const bundle = getSupabaseServerClient(request);
          return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
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
