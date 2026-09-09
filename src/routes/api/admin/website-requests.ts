import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminUser, jsonWithCookies, getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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

        const body = (await request.json().catch(() => ({}))) as { id?: string; status?: string };
        const { id, status } = body;
        if (!id || typeof id !== "string" || !status || typeof status !== "string") {
          return jsonWithCookies(
            verified.bundle,
            { error: "Invalid id or status." },
            { status: 400 },
          );
        }

        const admin = getSupabaseAdminClient();
        const { error } = await admin.from("website_requests").update({ status }).eq("id", id);
        if (error) {
          return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
        }
        return jsonWithCookies(verified.bundle, { ok: true });
      },
    },
  },
});
