import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const Route = createFileRoute("/api/team")({
  server: {
    handlers: {
      GET: async () => {
        const admin = getSupabaseAdminClient();
        const { data, error } = await admin
          .from("volunteers")
          .select("id, name, interest, school, grade_level, created_at")
          .eq("status", "completed")
          .not("interest", "like", "Summer Program:%")
          .order("created_at", { ascending: true });

        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }
        return Response.json(data ?? []);
      },
    },
  },
});
