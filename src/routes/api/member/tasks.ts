import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const VALID_STATUSES = new Set(["todo", "in_progress", "done"]);

export const Route = createFileRoute("/api/member/tasks")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const bundle = getSupabaseServerClient(request);
        const {
          data: { user },
        } = await bundle.client.auth.getUser();
        if (!user) {
          return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
        }

        const admin = getSupabaseAdminClient();
        const { data, error } = await admin
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          return jsonWithCookies(bundle, { error: error.message }, { status: 500 });
        }
        return jsonWithCookies(bundle, data ?? []);
      },

      PATCH: async ({ request }) => {
        const bundle = getSupabaseServerClient(request);
        const {
          data: { user },
        } = await bundle.client.auth.getUser();
        if (!user) {
          return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
        }

        const body = (await request.json().catch(() => ({}))) as {
          id?: string;
          status?: string;
        };

        if (!body.id || typeof body.id !== "string") {
          return jsonWithCookies(bundle, { error: "id is required." }, { status: 400 });
        }
        if (!body.status || !VALID_STATUSES.has(body.status)) {
          return jsonWithCookies(bundle, { error: "Invalid status." }, { status: 400 });
        }

        const admin = getSupabaseAdminClient();
        const { data, error } = await admin
          .from("tasks")
          .update({ status: body.status, updated_at: new Date().toISOString() })
          .eq("id", body.id)
          .select()
          .single();

        if (error) {
          return jsonWithCookies(bundle, { error: error.message }, { status: 500 });
        }
        return jsonWithCookies(bundle, data);
      },
    },
  },
});
