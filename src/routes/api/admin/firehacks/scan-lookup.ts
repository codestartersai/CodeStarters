import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies, verifyAdminUser } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { WAIVER_BUCKET } from "@/lib/firehacks/waiver-upload";

function waiverKindFromPath(path: string): "pdf" | "image" | null {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "heic" || ext === "heif") {
    return "image";
  }
  return null;
}

export const Route = createFileRoute("/api/admin/firehacks/scan-lookup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const adminAuth = await verifyAdminUser(request);
        if (!adminAuth) {
          const bundle = getSupabaseServerClient(request);
          return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
        }

        const { bundle } = adminAuth;
        const body = await request.json().catch(() => ({}));
        const token = typeof body.token === "string" ? body.token.trim() : "";
        if (!token) {
          return jsonWithCookies(bundle, { error: "token is required" }, { status: 400 });
        }

        const admin = getSupabaseAdminClient();
        const { data: participant, error } = await admin
          .from("firehacks_participants")
          .select("id, full_name, pass_token, waiver_storage_path, waiver_uploaded_at")
          .eq("pass_token", token)
          .single();

        if (error || !participant) {
          return jsonWithCookies(bundle, { error: "Participant not found" }, { status: 404 });
        }

        let waiverUrl: string | null = null;
        let waiverKind: "pdf" | "image" | null = null;

        if (participant.waiver_storage_path) {
          waiverKind = waiverKindFromPath(participant.waiver_storage_path);
          const { data: signed, error: signError } = await admin.storage
            .from(WAIVER_BUCKET)
            .createSignedUrl(participant.waiver_storage_path, 3600);

          if (!signError && signed?.signedUrl) {
            waiverUrl = signed.signedUrl;
          }
        }

        return jsonWithCookies(bundle, {
          id: participant.id,
          full_name: participant.full_name,
          pass_token: participant.pass_token,
          waiver_uploaded_at: participant.waiver_uploaded_at,
          waiver_url: waiverUrl,
          waiver_kind: waiverKind,
        });
      },
    },
  },
});
