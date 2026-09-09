import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  WAIVER_BUCKET,
  getAuthenticatedParticipant,
  isWaiverPathForParticipant,
} from "@/lib/firehacks/waiver-upload";

export const Route = createFileRoute("/api/firehacks/waiver/complete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bundle = getSupabaseServerClient(request);
        const auth = await getAuthenticatedParticipant(bundle);
        if ("error" in auth) {
          return jsonWithCookies(bundle, { error: auth.error.message }, { status: auth.error.status });
        }

        const body = await request.json().catch(() => ({}));
        const path = typeof body.path === "string" ? body.path.trim() : "";
        if (!path) {
          return jsonWithCookies(bundle, { error: "path is required" }, { status: 400 });
        }

        const { participant } = auth;
        if (!isWaiverPathForParticipant(path, participant.event_id, participant.id)) {
          return jsonWithCookies(bundle, { error: "Invalid upload path" }, { status: 400 });
        }

        const admin = getSupabaseAdminClient();
        const { error: downloadError } = await admin.storage.from(WAIVER_BUCKET).download(path);
        if (downloadError) {
          return jsonWithCookies(
            bundle,
            { error: "Upload not found. Please try uploading again." },
            { status: 400 },
          );
        }

        const uploadedAt = new Date().toISOString();
        const { error: updateError } = await admin
          .from("firehacks_participants")
          .update({ waiver_storage_path: path, waiver_uploaded_at: uploadedAt })
          .eq("id", participant.id);

        if (updateError) {
          return jsonWithCookies(bundle, { error: updateError.message }, { status: 500 });
        }

        if (participant.waiver_storage_path && participant.waiver_storage_path !== path) {
          await admin.storage.from(WAIVER_BUCKET).remove([participant.waiver_storage_path]);
        }

        return jsonWithCookies(bundle, {
          ok: true,
          waiver_storage_path: path,
          waiver_uploaded_at: uploadedAt,
        });
      },
    },
  },
});
