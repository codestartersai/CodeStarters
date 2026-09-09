import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  WAIVER_BUCKET,
  getAuthenticatedParticipant,
  validateWaiverFileMeta,
  waiverPathForParticipant,
} from "@/lib/firehacks/waiver-upload";

export const Route = createFileRoute("/api/firehacks/waiver/prepare")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bundle = getSupabaseServerClient(request);
        const auth = await getAuthenticatedParticipant(bundle);
        if (auth.error) {
          return jsonWithCookies(bundle, { error: auth.error.message }, { status: auth.error.status });
        }

        const body = await request.json().catch(() => ({}));
        const validated = validateWaiverFileMeta(body);
        if (validated.error) {
          return jsonWithCookies(bundle, { error: validated.error }, { status: 400 });
        }

        const { participant } = auth;
        const path = waiverPathForParticipant(
          participant.event_id,
          participant.id,
          validated.fileName!,
        );

        const admin = getSupabaseAdminClient();
        const { data, error } = await admin.storage
          .from(WAIVER_BUCKET)
          .createSignedUploadUrl(path, { upsert: false });

        if (error || !data?.signedUrl || !data.token) {
          return jsonWithCookies(
            bundle,
            { error: error?.message ?? "Could not create upload URL" },
            { status: 500 },
          );
        }

        return jsonWithCookies(bundle, {
          signedUrl: data.signedUrl,
          token: data.token,
          path: data.path ?? path,
        });
      },
    },
  },
});
