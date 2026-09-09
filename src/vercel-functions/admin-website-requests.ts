import type { IncomingMessage, ServerResponse } from "node:http";
import { getAdminClient, getAdminEnv, json, readJson, verifyAdmin } from "./admin-utils";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET" && req.method !== "PATCH")
    return json(res, 405, { error: "Method not allowed" });
  try {
    const env = getAdminEnv();
    const isAdmin = await verifyAdmin(req, env);
    if (!isAdmin) return json(res, 401, { error: "Unauthorized" });

    const admin = getAdminClient(env);
    if (req.method === "GET") {
      const { data, error } = await admin
        .from("website_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, data ?? []);
    }

    const body: Record<string, any> = await readJson(req).catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "";
    if (!id || !status) return json(res, 400, { error: "Invalid id or status." });

    const { error } = await admin.from("website_requests").update({ status }).eq("id", id);
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error("Admin website requests function error:", error);
    return json(res, 500, { error: "Could not load website requests." });
  }
}
