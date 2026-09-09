import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import type { TeamCategory, TeamMember } from "@/routes/api/admin/teams";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

type Volunteer = { id: string; name: string; interest?: string | null };

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [{ title: "Team — CodeStarters" }],
  }),
  component: TeamPage,
});

function TeamPage() {
  const [categories, setCategories] = useState<TeamCategory[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/team");
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setCategories(data.categories || []);
          setMembers(data.members || []);
          setVolunteers(data.volunteers || []);
        }
      } catch (err) {
        console.error("Failed to load team:", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const filteredMembers = members.filter((m) => {
    if (activeCategory === "all") return true;
    return m.category_id === activeCategory;
  });

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

        <motion.div {...fadeUp(0)} className="mb-14 text-center">
          <p className="mb-4 text-xs uppercase tracking-[3px] text-muted-foreground font-bold">Our Team</p>
          <h1 className="mb-4 font-serif text-5xl italic lg:text-6xl">Everyone on the team</h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Passionate high schoolers building the future of CS education, competitive robotics, and local business tech.
          </p>
        </motion.div>

        {/* Dynamic Department Tabs */}
        {categories.length > 0 && (
          <div className="mb-12 flex items-center justify-center flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeCategory === "all"
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All Departments ({members.length})
            </button>

            {categories.map((cat) => {
              const count = members.filter((m) => m.category_id === cat.id).length;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading team...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No team members in this department yet.
          </p>
        ) : (
          <div className="mb-24 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {filteredMembers.map((member, i) => {
              const catObj = categories.find((c) => c.id === member.category_id);
              return (
                <motion.div
                  key={member.id}
                  {...fadeUp(i * 0.03)}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-2xl bg-secondary relative">
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-3xl text-muted-foreground">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-bold leading-snug">{member.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{member.role}</p>
                  {catObj && activeCategory === "all" && (
                    <span className="mt-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      {catObj.name}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Volunteers & Community */}
        {volunteers.length > 0 && (
          <div className="pt-12 border-t border-border">
            <p className="mb-8 text-xs font-bold uppercase tracking-[3px] text-muted-foreground text-center">
              Student Mentors & Volunteers
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {volunteers.map((v, i) => (
                <motion.div
                  key={v.id}
                  {...fadeUp(i * 0.02)}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-secondary/50"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary text-foreground font-bold flex items-center justify-center text-sm mb-2">
                    {v.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="text-xs font-bold">{v.name}</h4>
                  {v.interest && <p className="text-[10px] text-muted-foreground mt-0.5">{v.interest}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
