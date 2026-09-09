import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies } from "@/lib/supabase/server";

export const Route = createFileRoute("/api/summer-signups")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bundle = getSupabaseServerClient(request);
        return jsonWithCookies(
          bundle,
          { error: "Summer bootcamp signups are closed." },
          { status: 410 },
        );
      },
    },
  },
});
