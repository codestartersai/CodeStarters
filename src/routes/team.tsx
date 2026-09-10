import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { TeamCategory, TeamMember } from "@/routes/api/admin/teams";

const FALLBACK_CATEGORIES: TeamCategory[] = [
  { id: "leadership", name: "Leadership", description: "Executive team and organization leads", order_index: 1 },
  { id: "ai", name: "AI Team", description: "AI mentors and curriculum developers", order_index: 2 },
  { id: "python", name: "Python Team", description: "Python instructors and team leads", order_index: 3 },
  { id: "robotics", name: "Robotics Team", description: "Robotics hardware, engineering, and mentors", order_index: 4 },
];

const FALLBACK_MEMBERS: (TeamMember & { image_position?: string; image_scale?: number })[] = [
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

type Volunteer = { id: string; name: string; interest?: string | null };

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [{ title: "Team — CodeStarters" }],
  }),
  component: TeamPage,
});

function TeamPage() {
  const [categories, setCategories] = useState<TeamCategory[]>(FALLBACK_CATEGORIES);
  const [members, setMembers] = useState<(TeamMember & { image_position?: string; image_scale?: number })[]>(FALLBACK_MEMBERS);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/team");
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
          if (Array.isArray(data.members) && data.members.length > 0) {
            setMembers(data.members);
          }
          if (Array.isArray(data.volunteers)) {
            setVolunteers(data.volunteers);
          }
        }
      } catch (err) {
        console.error("Failed to load team:", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  // Filter categories to only those that have members
  const activeCategories = categories.filter((cat) =>
    members.some((m) => m.category_id === cat.id)
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-12">
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mb-16 text-center">
          <p className="mb-4 text-xs uppercase tracking-[3px] text-muted-foreground font-semibold">Our Team</p>
          <h1 className="mb-4 font-serif text-5xl italic lg:text-6xl">Everyone on the team</h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Passionate high schoolers building the future of CS education and local business tech.
          </p>
        </div>

        {loading && members.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading team...</span>
          </div>
        ) : (
          <div className="space-y-20">
            {activeCategories.map((cat) => {
              const catMembers = members
                .filter((m) => m.category_id === cat.id)
                .sort((a, b) => (a.order_index ?? 99) - (b.order_index ?? 99));

              if (catMembers.length === 0) return null;

              return (
                <div key={cat.id} className="mb-20">
                  <p className="mb-8 text-xs font-bold uppercase tracking-[3px] text-muted-foreground">
                    {cat.name}
                  </p>
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
                    {catMembers.map((member) => (
                      <div key={member.id} className="flex flex-col items-center text-center group">
                        <div className="aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
                          {member.image_url ? (
                            <img
                              src={member.image_url}
                              alt={member.name}
                              className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                              style={{
                                objectPosition: member.image_position || "50% 20%",
                                transform: member.image_scale ? `scale(${member.image_scale})` : undefined,
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="text-4xl font-bold text-muted-foreground">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="mt-3 text-sm font-bold leading-snug">{member.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Volunteers & Community Mentors */}
        {volunteers.length > 0 && (
          <div className="pt-12 border-t border-border mt-20">
            <p className="mb-8 text-xs font-bold uppercase tracking-[3px] text-muted-foreground">
              Student Mentors &amp; Volunteers
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {volunteers.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-secondary/50"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary text-foreground font-bold flex items-center justify-center text-sm mb-2">
                    {v.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="text-xs font-bold">{v.name}</h4>
                  {v.interest && <p className="text-[10px] text-muted-foreground mt-0.5">{v.interest}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
