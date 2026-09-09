import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { ITEM_LIMITS } from "@/lib/firehacks-limits";

export const Route = createFileRoute("/api/firehacks/member/lookup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bundle = getSupabaseServerClient(request);
        const {
          data: { user },
        } = await bundle.client.auth.getUser();
        if (!user) return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });

        const { token } = await request.json().catch(() => ({}));
        if (!token) return jsonWithCookies(bundle, { error: "token is required" }, { status: 400 });

        const admin = getSupabaseAdminClient();

        const { data: participant, error: pErr } = await admin
          .from("firehacks_participants")
          .select("id, full_name, pass_token")
          .eq("pass_token", token)
          .single();

        if (pErr || !participant) {
          return jsonWithCookies(bundle, { error: "Participant not found" }, { status: 404 });
        }

        const { data: balanceRows } = await admin
          .from("firehacks_food_balance")
          .select("kind, count")
          .eq("participant_id", participant.id);

        const balances: Record<string, number> = { pizza: 0, chips: 0, drink: 0, water: 0 };
        for (const row of balanceRows ?? []) {
          balances[row.kind] = row.count;
        }

        return jsonWithCookies(bundle, { ...participant, balances, limits: ITEM_LIMITS });
      },
    },
  },
});
