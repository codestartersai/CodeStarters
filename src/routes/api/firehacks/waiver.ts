import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  WAIVER_BUCKET,
  getAuthenticatedParticipant,
  validateWaiverFileMeta,
  waiverPathForParticipant,
} from "@/lib/firehacks/waiver-upload";

export const Route = createFileRoute("/api/firehacks/waiver")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bundle = getSupabaseServerClient(request);
        const auth = await getAuthenticatedParticipant(bundle);
        if ("error" in auth) {
          return jsonWithCookies(bundle, { error: auth.error.message }, { status: auth.error.status });
        }

        const contentType = request.headers.get("content-type") ?? "";
        if (!contentType.includes("multipart/form-data")) {
          return jsonWithCookies(
            bundle,
            { error: "Use /api/firehacks/waiver/prepare for uploads" },
            { status: 400 },
          );
        }

        let formData: FormData;
        try {
          formData = await request.formData();
        } catch {
          return jsonWithCookies(
            bundle,
            { error: "Expected multipart form data" },
            { status: 400 },
          );
        }

        const file = formData.get("file");
        if (!(file instanceof File)) {
          return jsonWithCookies(bundle, { error: "Missing file field" }, { status: 400 });
        }

        const validated = validateWaiverFileMeta({
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
        });
        if ("error" in validated) {
          const status = validated.error.includes("15 MB") ? 413 : 415;
          return jsonWithCookies(bundle, { error: validated.error }, { status });
        }

        const { participant } = auth;
        const admin = getSupabaseAdminClient();
        const path = waiverPathForParticipant(
          participant.event_id,
          participant.id,
          validated.fileName,
        );
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await admin.storage
          .from(WAIVER_BUCKET)
          .upload(path, buffer, { contentType: validated.contentType, upsert: false });

        if (uploadError) {
          return jsonWithCookies(bundle, { error: uploadError.message }, { status: 500 });
        }

        const uploadedAt = new Date().toISOString();
        const { error: updateError } = await admin
          .from("firehacks_participants")
          .update({ waiver_storage_path: path, waiver_uploaded_at: uploadedAt })
          .eq("id", participant.id);

        if (updateError) {
          await admin.storage.from(BUCKET).remove([path]);
          return jsonWithCookies(bundle, { error: updateError.message }, { status: 500 });
        }

        if (participant.waiver_storage_path && participant.waiver_storage_path !== path) {
          await admin.storage.from(BUCKET).remove([participant.waiver_storage_path]);
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
