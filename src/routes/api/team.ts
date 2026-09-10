import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const DEFAULT_CATEGORIES = [
    { id: "leadership", name: "Leadership", description: "Executive team and organization leads", order_index: 1 },
    { id: "ai", name: "AI Team", description: "AI mentors and curriculum developers", order_index: 2 },
    { id: "python", name: "Python Team", description: "Python instructors and team leads", order_index: 3 },
    { id: "robotics", name: "Robotics Team", description: "Robotics hardware, engineering, and mentors", order_index: 4 },
];

export const DEFAULT_MEMBERS = [
    {
        id: "mem-smaran",
        name: "Smaran Aramballi Sandarsh",
        role: "Founder & President",
        category_id: "leadership",
        image_url: "/smaran.png",
        image_position: "50% 20%",
        image_scale: 1.18,
        order_index: 1,
    },
    {
        id: "mem-amogh",
        name: "Amogh Bhatta",
        role: "Founder & Director of Robotics",
        category_id: "leadership",
        image_url: "/amogh.webp",
        image_position: "50% 15%",
        image_scale: 1.25,
        order_index: 2,
    },
    {
        id: "mem-reyansh",
        name: "Reyansh Nankani",
        role: "Founder & Vice-President",
        category_id: "leadership",
        image_url: "/team/reyansh-nankani.png",
        image_position: "50% 22%",
        image_scale: 1.18,
        order_index: 3,
    },
    {
        id: "mem-pranav",
        name: "Pranav C",
        role: "Founder & Head of AI, Finance, and Legal",
        category_id: "leadership",
        image_url: "/team/pranav-c.png",
        image_position: "50% 22%",
        image_scale: 1.18,
        order_index: 4,
    },
    {
        id: "mem-aljer",
        name: "Aljer Almazan",
        role: "Director of Python",
        category_id: "leadership",
        image_url: "/team/aljer-almazan.webp",
        image_position: "50% 6%",
        image_scale: 1.0,
        order_index: 5,
    },
    {
        id: "mem-carter",
        name: "Carter Chang",
        role: "AI Mentor",
        category_id: "ai",
        image_url: "/team/carter-chang.png",
        image_position: "50% 18%",
        image_scale: 1.12,
        order_index: 1,
    },
    {
        id: "mem-jahan",
        name: "Jahan Vora",
        role: "Marketing Team Member",
        category_id: "python",
        image_url: null,
        order_index: 1,
    },
    {
        id: "mem-mridhula",
        name: "Mridhula Ganesh Kumar",
        role: "Marketing Team Member",
        category_id: "robotics",
        image_url: "/team/mridhula-ganesh-kumar.webp",
        image_position: "50% 28%",
        image_scale: 1.1,
        order_index: 1,
    },
];

export const Route = createFileRoute("/api/team")({
    server: {
        handlers: {
            GET: async () => {
                const admin = getSupabaseAdminClient();

                let categories = DEFAULT_CATEGORIES;
                let members = DEFAULT_MEMBERS;
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
                    if (memRes.data && memRes.data.length > 0) {
                        members = memRes.data as typeof DEFAULT_MEMBERS;
                    }
                    if (volRes.data) {
                        volunteers = volRes.data;
                    }
                } catch {
                    // Fallback to defaults
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
