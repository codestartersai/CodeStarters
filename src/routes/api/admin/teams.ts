import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminUser, jsonWithCookies, getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasPermission } from "@/lib/admin-auth";

export type TeamCategory = {
    id: string;
    name: string;
    description?: string | null;
    order_index: number;
    is_active?: boolean;
};

export type TeamMember = {
    id: string;
    name: string;
    role: string;
    category_id: string;
    image_url?: string | null;
    bio?: string | null;
    social_links?: string | null;
    order_index: number;
    is_active?: boolean;
    created_at?: string;
};

const DEFAULT_CATEGORIES: TeamCategory[] = [
    { id: "leadership", name: "Leadership", description: "Executive team and department leads", order_index: 1 },
    { id: "robotics", name: "Robotics Team", description: "Robotics hardware, engineering, and mentors", order_index: 2 },
    { id: "webdev", name: "Web Development", description: "Developers building websites for local businesses", order_index: 3 },
    { id: "education", name: "Education & AI", description: "Mentors teaching youth CS and AI", order_index: 4 },
    { id: "marketing", name: "Marketing & Outreach", description: "Community outreach and partnerships", order_index: 5 },
];

export const Route = createFileRoute("/api/admin/teams")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const verified = await verifyAdminUser(request);
                if (!verified) {
                    const bundle = getSupabaseServerClient(request);
                    return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
                }

                const admin = getSupabaseAdminClient();

                let categories: TeamCategory[] = [];
                let members: TeamMember[] = [];

                try {
                    const { data: catData, error: catErr } = await admin
                        .from("team_categories")
                        .select("*")
                        .order("order_index", { ascending: true });

                    if (catErr || !catData || catData.length === 0) {
                        for (const cat of DEFAULT_CATEGORIES) {
                            await admin.from("team_categories").upsert(cat).catch(() => {});
                        }
                        categories = DEFAULT_CATEGORIES;
                    } else {
                        categories = catData;
                    }

                    const { data: memData } = await admin
                        .from("team_members")
                        .select("*")
                        .order("order_index", { ascending: true });

                    members = memData ?? [];
                } catch {
                    categories = DEFAULT_CATEGORIES;
                    members = [];
                }

                return jsonWithCookies(verified.bundle, {
                    categories,
                    members,
                });
            },

            POST: async ({ request }) => {
                const verified = await verifyAdminUser(request);
                if (!verified) {
                    const bundle = getSupabaseServerClient(request);
                    return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
                }

                if (!hasPermission(verified.permissions, "manage_team")) {
                    return jsonWithCookies(verified.bundle, { error: "Permission denied." }, { status: 403 });
                }

                const body = await request.json().catch(() => ({})) as {
                    type: "category" | "member";
                    category?: { id?: string; name: string; description?: string; order_index?: number };
                    member?: { name: string; role: string; category_id: string; image_url?: string; bio?: string; social_links?: string; order_index?: number };
                };

                const admin = getSupabaseAdminClient();

                if (body.type === "category" && body.category) {
                    const name = body.category.name.trim();
                    if (!name) return jsonWithCookies(verified.bundle, { error: "Category name required." }, { status: 400 });
                    const id = (body.category.id || name.toLowerCase().replace(/[^a-z0-9]/g, "-")).trim();

                    const { data, error } = await admin
                        .from("team_categories")
                        .insert({
                            id,
                            name,
                            description: body.category.description || null,
                            order_index: body.category.order_index ?? 99,
                        })
                        .select()
                        .single();

                    if (error) return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
                    return jsonWithCookies(verified.bundle, { ok: true, category: data });
                }

                if (body.type === "member" && body.member) {
                    const { name, role, category_id, image_url, bio, social_links, order_index } = body.member;
                    if (!name || !role || !category_id) {
                        return jsonWithCookies(verified.bundle, { error: "Name, role, and team tab category are required." }, { status: 400 });
                    }

                    const { data, error } = await admin
                        .from("team_members")
                        .insert({
                            name: name.trim(),
                            role: role.trim(),
                            category_id,
                            image_url: image_url?.trim() || null,
                            bio: bio?.trim() || null,
                            social_links: social_links?.trim() || null,
                            order_index: order_index ?? 99,
                        })
                        .select()
                        .single();

                    if (error) return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
                    return jsonWithCookies(verified.bundle, { ok: true, member: data });
                }

                return jsonWithCookies(verified.bundle, { error: "Invalid type or payload." }, { status: 400 });
            },

            PATCH: async ({ request }) => {
                const verified = await verifyAdminUser(request);
                if (!verified) {
                    const bundle = getSupabaseServerClient(request);
                    return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
                }

                if (!hasPermission(verified.permissions, "manage_team")) {
                    return jsonWithCookies(verified.bundle, { error: "Permission denied." }, { status: 403 });
                }

                const body = await request.json().catch(() => ({})) as {
                    type: "category" | "member";
                    id: string;
                    updates: Record<string, unknown>;
                };

                if (!body.id || !body.updates) {
                    return jsonWithCookies(verified.bundle, { error: "Missing ID or updates." }, { status: 400 });
                }

                const admin = getSupabaseAdminClient();
                const table = body.type === "category" ? "team_categories" : "team_members";

                const { error } = await admin.from(table).update(body.updates).eq("id", body.id);
                if (error) return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });

                return jsonWithCookies(verified.bundle, { ok: true });
            },

            DELETE: async ({ request }) => {
                const verified = await verifyAdminUser(request);
                if (!verified) {
                    const bundle = getSupabaseServerClient(request);
                    return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
                }

                if (!hasPermission(verified.permissions, "manage_team")) {
                    return jsonWithCookies(verified.bundle, { error: "Permission denied." }, { status: 403 });
                }

                const url = new URL(request.url);
                const type = url.searchParams.get("type");
                const id = url.searchParams.get("id");

                if (!type || !id) {
                    return jsonWithCookies(verified.bundle, { error: "Type and ID required." }, { status: 400 });
                }

                const admin = getSupabaseAdminClient();

                if (type === "category") {
                    // Delete members in category first, then category
                    await admin.from("team_members").delete().eq("category_id", id);
                    const { error } = await admin.from("team_categories").delete().eq("id", id);
                    if (error) return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
                    return jsonWithCookies(verified.bundle, { ok: true, removed: "category" });
                }

                if (type === "member") {
                    const { error } = await admin.from("team_members").delete().eq("id", id);
                    if (error) return jsonWithCookies(verified.bundle, { error: error.message }, { status: 500 });
                    return jsonWithCookies(verified.bundle, { ok: true, removed: "member" });
                }

                return jsonWithCookies(verified.bundle, { error: "Invalid type." }, { status: 400 });
            },
        },
    },
});
