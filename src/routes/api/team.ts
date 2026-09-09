import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const DEFAULT_CATEGORIES = [
    { id: "leadership", name: "Leadership", description: "Executive team and department leads", order_index: 1 },
    { id: "robotics", name: "Robotics Team", description: "Robotics hardware, engineering, and mentors", order_index: 2 },
    { id: "webdev", name: "Web Development", description: "Developers building websites for local businesses", order_index: 3 },
    { id: "education", name: "Education & AI", description: "Mentors teaching youth CS and AI", order_index: 4 },
    { id: "marketing", name: "Marketing & Outreach", description: "Community outreach and partnerships", order_index: 5 },
];

export const Route = createFileRoute("/api/team")({
    server: {
        handlers: {
            GET: async () => {
                const admin = getSupabaseAdminClient();

                let categories = DEFAULT_CATEGORIES;
                let members: unknown[] = [];
                let volunteers: Array<{ id: string; name: string; interest?: string | null }> = [];

                try {
                    const [catRes, memRes, volRes] = await Promise.all([
                        admin.from("team_categories").select("*").order("order_index", { ascending: true }),
                        admin.from("team_members").select("*").order("order_index", { ascending: true }),
                        admin.from("volunteers").select("id, name, interest").eq("status", "completed").order("created_at", { ascending: true }),
                    ]);

                    if (catRes.data && catRes.data.length > 0) {
                        categories = catRes.data;
                    }
                    if (memRes.data) {
                        members = memRes.data;
                    }
                    if (volRes.data) {
                        volunteers = volRes.data;
                    }
                } catch {
                    // Fallback to empty
                }

                return Response.json({
                    categories,
                    members,
                    volunteers,
                });
            },
        },
    },
});
