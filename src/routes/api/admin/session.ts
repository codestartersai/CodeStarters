import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies, verifyAdminUser } from "@/lib/supabase/server";

function json(body: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  return new Response(JSON.stringify(body), { ...init, headers });
}

export const Route = createFileRoute("/api/admin/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const verified = await verifyAdminUser(request);
          if (!verified) {
            const bundle = getSupabaseServerClient(request);
            return jsonWithCookies(bundle, { authenticated: false }, { status: 401 });
          }

          return jsonWithCookies(verified.bundle, {
            authenticated: true,
            user: {
              id: verified.user.id,
              email: verified.user.email,
            },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Admin session check failed.";
          return json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
