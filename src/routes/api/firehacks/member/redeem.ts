import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { ITEM_LIMITS } from "@/lib/firehacks-limits";

export const Route = createFileRoute("/api/firehacks/member/redeem")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bundle = getSupabaseServerClient(request);
        const {
          data: { user },
        } = await bundle.client.auth.getUser();
        if (!user) return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });

        const { participantId, kind, delta } = await request.json().catch(() => ({}));
        if (!participantId || !kind) {
          return jsonWithCookies(
            bundle,
            { error: "participantId and kind are required" },
            { status: 400 },
          );
        }
        if (!(kind in ITEM_LIMITS)) {
          return jsonWithCookies(bundle, { error: "Invalid item kind" }, { status: 400 });
        }

        const step = delta === -1 ? -1 : 1;
        const max = ITEM_LIMITS[kind];
        const admin = getSupabaseAdminClient();

        const { data: existing } = await admin
          .from("firehacks_food_balance")
          .select("count")
          .eq("participant_id", participantId)
          .eq("kind", kind)
          .maybeSingle();

        const current = existing?.count ?? 0;
        const next = Math.max(0, Math.min(max, current + step));

        if (next === current) {
          return jsonWithCookies(bundle, { count: current, max, atLimit: current >= max });
        }

        const { error } = await admin.from("firehacks_food_balance").upsert(
          {
            participant_id: participantId,
            kind,
            count: next,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "participant_id,kind" },
        );

        if (error) {
          console.error("Balance upsert error:", error);
          return jsonWithCookies(bundle, { error: error.message }, { status: 500 });
        }

        return jsonWithCookies(bundle, { count: next, max, atLimit: next >= max });
      },
    },
  },
});
