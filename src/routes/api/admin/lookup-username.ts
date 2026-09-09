import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const Route = createFileRoute("/api/admin/lookup-username")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const bundle = getSupabaseServerClient(request);
                const body = await request.json().catch(() => ({})) as { identifier?: string };
                const identifier = body.identifier?.trim() || "";

                if (!identifier) {
                    return jsonWithCookies(bundle, { email: null }, { status: 400 });
                }

                if (identifier.includes("@")) {
                    return jsonWithCookies(bundle, { email: identifier.toLowerCase() });
                }

                const admin = getSupabaseAdminClient();
                const { data, error } = await admin
                    .from("admin_users")
                    .select("email")
                    .ilike("name", identifier)
                    .limit(1)
                    .maybeSingle();

                if (error || !data) {
                    return jsonWithCookies(bundle, { email: null });
                }

                return jsonWithCookies(bundle, { email: data.email });
            },
        },
    },
});
