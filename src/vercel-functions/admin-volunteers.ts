import type { IncomingMessage, ServerResponse } from "node:http";
import {
  getAdminClient,
  getAdminEnv,
  getRequestUrl,
  json,
  readJson,
  verifyAdmin,
} from "./admin-utils";
import { attachResumeUrls } from "../lib/volunteer-resumes";

const VOLUNTEER_STATUSES = new Set(["pending", "contacted", "rejected", "completed"]);

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET" && req.method !== "PATCH")
    return json(res, 405, { error: "Method not allowed" });
  try {
    const env = getAdminEnv();
    const isAdmin = await verifyAdmin(req, env);
    if (!isAdmin) return json(res, 401, { error: "Unauthorized" });

    const admin = getAdminClient(env);
    if (req.method === "GET") {
      const scope = getRequestUrl(req).searchParams.get("scope");
      if (scope !== "applications" && scope !== "team") {
        return json(res, 400, { error: "Invalid scope. Use applications or team." });
      }

      let query = admin.from("volunteers").select("*").order("created_at", { ascending: false });
      query =
        scope === "applications"
          ? query.neq("status", "completed").not("interest", "like", "Summer Program:%")
          : query.eq("status", "completed").not("interest", "like", "Summer Program:%");
      const { data, error } = await query;
      if (error) return json(res, 500, { error: error.message });
      const withResumes = await attachResumeUrls(admin, data ?? []);
      return json(res, 200, withResumes);
    }

    const body: Record<string, any> = await readJson(req).catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "";
    if (!id || !VOLUNTEER_STATUSES.has(status)) {
      return json(res, 400, { error: "Invalid id or status." });
    }

    const { error } = await admin.from("volunteers").update({ status }).eq("id", id);
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error("Admin volunteers function error:", error);
    return json(res, 500, { error: "Could not load volunteers." });
  }
}
