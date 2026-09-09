import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminUser, jsonWithCookies, getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const Route = createFileRoute("/api/admin/dashboard-stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const verified = await verifyAdminUser(request);
        if (!verified) {
          const bundle = getSupabaseServerClient(request);
          return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
        }

        const admin = getSupabaseAdminClient();
        const volunteerApplicationFilter = <T>(q: T): T =>
          (q as any).not("interest", "like", "Summer Program:%");

        const [
          { count: requests, error: e1 },
          { count: pendingRequests, error: e2 },
          { count: pendingApps, error: e3 },
          { count: teamMembers, error: e4 },
        ] = await Promise.all([
          admin.from("website_requests").select("*", { count: "exact", head: true }),
          admin
            .from("website_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          volunteerApplicationFilter(
            admin
              .from("volunteers")
              .select("*", { count: "exact", head: true })
              .eq("status", "pending"),
          ),
          volunteerApplicationFilter(
            admin
              .from("volunteers")
              .select("*", { count: "exact", head: true })
              .eq("status", "completed"),
          ),
        ]);

        if (e1 || e2 || e3 || e4) {
          const msg = [e1, e2, e3, e4].find(Boolean)?.message ?? "Query failed";
          return jsonWithCookies(verified.bundle, { error: msg }, { status: 500 });
        }

        return jsonWithCookies(verified.bundle, {
          requests: requests ?? 0,
          pendingRequests: pendingRequests ?? 0,
          pendingApps: pendingApps ?? 0,
          teamMembers: teamMembers ?? 0,
        });
      },
    },
  },
});
