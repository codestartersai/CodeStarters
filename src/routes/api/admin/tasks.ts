import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminUser, jsonWithCookies, getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const VALID_STATUSES = new Set(["todo", "in_progress", "done"]);
const VALID_PRIORITIES = new Set(["low", "medium", "high"]);

export const Route = createFileRoute("/api/admin/tasks")({
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
          .from("tasks")
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

        const body = (await request.json().catch(() => ({}))) as {
          title?: string;
          description?: string;
          status?: string;
          priority?: string;
          assigned_to?: string[];
          due_date?: string;
          created_by?: string;
        };

        if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
          return jsonWithCookies(verified.bundle, { error: "Title is required." }, { status: 400 });
        }

        const status = body.status && VALID_STATUSES.has(body.status) ? body.status : "todo";
        const priority =
          body.priority && VALID_PRIORITIES.has(body.priority) ? body.priority : "medium";
        const assigned_to =
          Array.isArray(body.assigned_to) && body.assigned_to.length > 0
            ? body.assigned_to.filter((s) => typeof s === "string" && s.trim())
            : null;

        const admin = getSupabaseAdminClient();
        const { data, error } = await admin
          .from("tasks")
          .insert({
            title: body.title.trim(),
            description: body.description?.trim() || null,
            status,
            priority,
            assigned_to,
            due_date: body.due_date || null,
            created_by: body.created_by?.trim() || null,
          })
          .select()
          .single();

        if (error) {
          return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
        }
        return jsonWithCookies(verified.bundle, data, { status: 201 });
      },

      PATCH: async ({ request }) => {
        const verified = await verifyAdminUser(request);
        if (!verified) {
          const bundle = getSupabaseServerClient(request);
          return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
        }

        const body = (await request.json().catch(() => ({}))) as {
          id?: string;
          title?: string;
          description?: string;
          status?: string;
          priority?: string;
          assigned_to?: string[];
          due_date?: string;
        };

        if (!body.id || typeof body.id !== "string") {
          return jsonWithCookies(verified.bundle, { error: "id is required." }, { status: 400 });
        }

        const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (body.title !== undefined) update.title = body.title.trim();
        if (body.description !== undefined) update.description = body.description?.trim() || null;
        if (body.status !== undefined && VALID_STATUSES.has(body.status))
          update.status = body.status;
        if (body.priority !== undefined && VALID_PRIORITIES.has(body.priority))
          update.priority = body.priority;
        if (body.assigned_to !== undefined) {
          update.assigned_to =
            Array.isArray(body.assigned_to) && body.assigned_to.length > 0
              ? body.assigned_to.filter((s) => typeof s === "string" && s.trim())
              : null;
        }
        if (body.due_date !== undefined) update.due_date = body.due_date || null;

        const admin = getSupabaseAdminClient();
        const { data, error } = await admin
          .from("tasks")
          .update(update)
          .eq("id", body.id)
          .select()
          .single();

        if (error) {
          return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
        }
        return jsonWithCookies(verified.bundle, data);
      },

      DELETE: async ({ request }) => {
        const verified = await verifyAdminUser(request);
        if (!verified) {
          const bundle = getSupabaseServerClient(request);
          return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) {
          return jsonWithCookies(verified.bundle, { error: "id is required." }, { status: 400 });
        }

        const admin = getSupabaseAdminClient();
        const { error } = await admin.from("tasks").delete().eq("id", id);
        if (error) {
          return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
        }
        return jsonWithCookies(verified.bundle, { ok: true });
      },
    },
  },
});
