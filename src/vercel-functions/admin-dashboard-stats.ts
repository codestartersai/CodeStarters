import type { IncomingMessage, ServerResponse } from "node:http";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminClient, getAdminEnv, json, verifyAdmin } from "./admin-utils";

type CountQuery = PromiseLike<{ count: number | null; error: unknown }>;

function errorMessage(error: unknown): string {
  return error && typeof error === "object" && "message" in error
    ? String((error as { message?: unknown }).message)
    : "Query failed";
}

async function safeCount(label: string, query: CountQuery): Promise<number> {
  try {
    const { count, error } = await query;
    if (error) {
      console.error(`[dashboard-stats] ${label} failed:`, errorMessage(error));
      return 0;
    }
    return count ?? 0;
  } catch (error) {
    console.error(`[dashboard-stats] ${label} threw:`, error);
    return 0;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  try {
    const env = getAdminEnv();
    const isAdmin = await verifyAdmin(req, env);
    if (!isAdmin) return json(res, 401, { error: "Unauthorized" });

    const admin: SupabaseClient = getAdminClient(env);
    const volunteerApplicationFilter = <T extends { not: (col: string, op: string, val: string) => T }>(
      query: T,
    ) => query.not("interest", "like", "Summer Program:%");

    const [requests, pendingRequests, pendingApps, teamMembers] = await Promise.all([
      safeCount(
        "requests",
        admin.from("website_requests").select("*", { count: "exact", head: true }),
      ),
      safeCount(
        "pendingRequests",
        admin
          .from("website_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
      ),
      safeCount(
        "pendingApps",
        volunteerApplicationFilter(
          admin
            .from("volunteers")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        ),
      ),
      safeCount(
        "teamMembers",
        volunteerApplicationFilter(
          admin
            .from("volunteers")
            .select("*", { count: "exact", head: true })
            .eq("status", "completed"),
        ),
      ),
    ]);

    return json(res, 200, { requests, pendingRequests, pendingApps, teamMembers });
  } catch (error) {
    console.error("Dashboard stats function error:", error);
    return json(res, 500, { error: "Could not load dashboard statistics." });
  }
}
