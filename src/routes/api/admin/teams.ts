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
    { id: "leadership", name: "Leadership", description: "Executive team and organization leads", order_index: 1 },
    { id: "ai", name: "AI Team", description: "AI mentors and curriculum developers", order_index: 2 },
    { id: "python", name: "Python Team", description: "Python instructors and team leads", order_index: 3 },
    { id: "robotics", name: "Robotics Team", description: "Robotics hardware, engineering, and mentors", order_index: 4 },
    { id: "webdev", name: "Web Development", description: "Developers creating websites for local businesses", order_index: 5 },
    { id: "marketing", name: "Marketing & Outreach", description: "Community outreach, growth, and partnerships", order_index: 6 },
];

const DEFAULT_ADMIN_MEMBERS: TeamMember[] = [
    {
        id: "11111111-1111-1111-1111-111111111101",
        name: "Smaran Aramballi Sandarsh",
        role: "Founder & President",
        category_id: "leadership",
        image_url: "/smaran.png",
        order_index: 1,
    },
    {
        id: "11111111-1111-1111-1111-111111111102",
        name: "Amogh Bhatta",
        role: "Founder & Director of Robotics",
        category_id: "leadership",
        image_url: "/amogh.webp",
        order_index: 2,
    },
    {
        id: "11111111-1111-1111-1111-111111111103",
        name: "Reyansh Nankani",
        role: "Founder & Vice-President",
        category_id: "leadership",
        image_url: "/team/reyansh-nankani.png",
        order_index: 3,
    },
    {
        id: "11111111-1111-1111-1111-111111111104",
        name: "Pranav C",
        role: "Founder & Head of AI, Finance, and Legal",
        category_id: "leadership",
        image_url: "/team/pranav-c.png",
        order_index: 4,
    },
    {
        id: "11111111-1111-1111-1111-111111111105",
        name: "Aljer Almazan",
        role: "Director of Python",
        category_id: "leadership",
        image_url: "/team/aljer-almazan.webp",
        order_index: 5,
    },
    {
        id: "11111111-1111-1111-1111-111111111106",
        name: "Carter Chang",
        role: "AI Mentor",
        category_id: "ai",
        image_url: "/team/carter-chang.png",
        order_index: 1,
    },
    {
        id: "11111111-1111-1111-1111-111111111107",
        name: "Jahan Vora",
        role: "Marketing Team Member",
        category_id: "python",
        image_url: null,
        order_index: 1,
    },
    {
        id: "11111111-1111-1111-1111-111111111108",
        name: "Mridhula Ganesh Kumar",
        role: "Marketing Team Member",
        category_id: "robotics",
        image_url: "/team/mridhula-ganesh-kumar.webp",
        order_index: 1,
    },
];

export let _memoryCategories: TeamCategory[] = [...DEFAULT_CATEGORIES];
export let _memoryMembers: TeamMember[] = [...DEFAULT_ADMIN_MEMBERS];

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

                let categories: TeamCategory[] = _memoryCategories;
                let members: TeamMember[] = _memoryMembers;

                try {
                    const { data: catData } = await admin
                        .from("team_categories")
                        .select("*")
                        .order("order_index", { ascending: true });

                    if (catData && catData.length > 0) {
                        categories = catData;
                        _memoryCategories = catData;
                    }

                    const { data: memData } = await admin
                        .from("team_members")
                        .select("*")
                        .order("order_index", { ascending: true });

                    if (memData && memData.length > 0) {
                        members = memData;
                        _memoryMembers = memData;
                    }
                } catch {
                    // Fall back to memory
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

                    const newCat: TeamCategory = {
                        id,
                        name,
                        description: body.category.description || null,
                        order_index: body.category.order_index ?? 99,
                    };

                    _memoryCategories = [..._memoryCategories.filter((c) => c.id !== id), newCat];

                    try { await admin.from("team_categories").upsert(newCat); } catch {}
                    try { await verified.bundle.client.from("team_categories").upsert(newCat); } catch {}

                    return jsonWithCookies(verified.bundle, { ok: true, category: newCat });
                }

                if (body.type === "member" && body.member) {
                    const { name, role, category_id, image_url, bio, social_links, order_index } = body.member;
                    if (!name || !role || !category_id) {
                        return jsonWithCookies(verified.bundle, { error: "Name, role, and team tab category are required." }, { status: 400 });
                    }

                    // Auto-ensure category exists to satisfy foreign keys
                    const cat = _memoryCategories.find((c) => c.id === category_id) || {
                        id: category_id,
                        name: category_id.charAt(0).toUpperCase() + category_id.slice(1),
                        order_index: 99,
                    };
                    if (!_memoryCategories.some((c) => c.id === category_id)) {
                        _memoryCategories.push(cat);
                    }
                    try { await admin.from("team_categories").upsert(cat); } catch {}
                    try { await verified.bundle.client.from("team_categories").upsert(cat); } catch {}

                    const generatedId = `11111111-1111-1111-1111-${Date.now().toString().slice(-12).padStart(12, "0")}`;
                    const newMember: TeamMember = {
                        id: generatedId,
                        name: name.trim(),
                        role: role.trim(),
                        category_id,
                        image_url: image_url?.trim() || null,
                        bio: bio?.trim() || null,
                        social_links: social_links?.trim() || null,
                        order_index: order_index ?? 99,
                    };

                    _memoryMembers = [..._memoryMembers.filter((m) => m.id !== newMember.id), newMember];

                    let dbMember = newMember;
                    try {
                        const { data: d1, error: e1 } = await admin
                            .from("team_members")
                            .insert(newMember)
                            .select()
                            .maybeSingle();

                        if (!e1 && d1) {
                            dbMember = d1;
                        } else {
                            const { data: d2 } = await verified.bundle.client
                                .from("team_members")
                                .insert(newMember)
                                .select()
                                .maybeSingle();
                            if (d2) dbMember = d2;
                        }
                    } catch (err) {
                        console.warn("DB insert exception handled:", err);
                    }

                    return jsonWithCookies(verified.bundle, { ok: true, member: dbMember });
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

                if (body.type === "member") {
                    _memoryMembers = _memoryMembers.map((m) => m.id === body.id ? { ...m, ...body.updates } : m);
                } else if (body.type === "category") {
                    _memoryCategories = _memoryCategories.map((c) => c.id === body.id ? { ...c, ...body.updates } : c);
                }

                try {
                    await admin.from(table).update(body.updates).eq("id", body.id);
                } catch {}
                try {
                    await verified.bundle.client.from(table).update(body.updates).eq("id", body.id);
                } catch {}

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
                    _memoryCategories = _memoryCategories.filter((c) => c.id !== id);
                    _memoryMembers = _memoryMembers.filter((m) => m.category_id !== id);
                    try {
                        await admin.from("team_members").delete().eq("category_id", id);
                        await admin.from("team_categories").delete().eq("id", id);
                    } catch {}
                    return jsonWithCookies(verified.bundle, { ok: true, removed: "category" });
                }

                if (type === "member") {
                    _memoryMembers = _memoryMembers.filter((m) => m.id !== id);
                    try {
                        await admin.from("team_members").delete().eq("id", id);
                    } catch {}
                    try {
                        await verified.bundle.client.from("team_members").delete().eq("id", id);
                    } catch {}
                    return jsonWithCookies(verified.bundle, { ok: true, removed: "member" });
                }

                return jsonWithCookies(verified.bundle, { error: "Invalid type." }, { status: 400 });
            },
        },
    },
});
