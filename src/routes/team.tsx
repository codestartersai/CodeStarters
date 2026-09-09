import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

type TeamMember = {
  id: string;
  name: string;
  title: string;
  img?: string;
};

/** Featured roster. People with multiple roles list all of them. */
const MEMBERS: Record<string, TeamMember> = {
  smaran: {
    id: "smaran",
    name: "Smaran Aramballi Sandarsh",
    title: "Founder & President",
    img: "/smaran.png",
  },
  amogh: {
    id: "amogh",
    name: "Amogh Bhatta",
    title: "Director of Robotics",
    img: "/amogh.webp",
  },
  reyansh: {
    id: "reyansh",
    name: "Reyansh Nankani",
    title: "Founder & Vice-President",
    img: "/team/reyansh-nankani.png",
  },
  pranav: {
    id: "pranav",
    name: "Pranav C",
    title: "Founder & Head of AI, Finance, and Legal",
    img: "/team/pranav-c.png",
  },
  aljer: {
    id: "aljer",
    name: "Aljer Almazan",
    title: "Director of Python",
    img: "/team/aljer-almazan.webp",
  },
  mridhula: {
    id: "mridhula",
    name: "Mridhula Ganesh Kumar",
    title: "Marketing Team Member",
    img: "/team/mridhula-ganesh-kumar.webp",
  },
  carter: {
    id: "carter",
    name: "Carter Chang",
    title: "AI Mentor",
    img: "/team/carter-chang.png",
  },
  jahan: {
    id: "jahan",
    name: "Jahan Vora",
    title: "Marketing Team Member",
  },
};

const DEPARTMENTS: Array<{ label: string; memberIds: string[] }> = [
  {
    label: "Leadership",
    memberIds: ["smaran", "amogh", "reyansh", "pranav", "aljer"],
  },
  {
    label: "AI Team",
    memberIds: ["carter"],
  },
  {
    label: "Python Team",
    memberIds: ["jahan"],
  },
  {
    label: "Robotics Team",
    memberIds: ["mridhula"],
  },
];

const FEATURED_TEAM_NAMES = new Set([
  ...Object.values(MEMBERS).map((member) => member.name.trim().toLowerCase()),
  "pranav chintalapati",
  "mridhula ganesh kumar",
  "ridhula ganesh kumar",
]);

type Headshot = { src: string; pos?: string; scale?: number };

const DEFAULT_HEADSHOT_POS = "50% 22%";
const DEFAULT_HEADSHOT_SCALE = 1.18;

const HEADSHOTS: Record<string, Headshot> = {
  "shaurya gakhar": { src: "/team/shaurya-gakhar.png" },
  "reyansh nankani": { src: "/team/reyansh-nankani.png" },
  "pranav c": { src: "/team/pranav-c.png" },
  "pranav chintalapati": { src: "/team/pranav-c.png" },
  "michael cutsail": { src: "/team/michael-cutsail.png" },
  "arnav ghildiyal": { src: "/arnav.webp" },
  "sai sanjit reddy vallapureddy": { src: "/sai.webp" },
  sanju: { src: "/sai.webp" },
  "robin zhou": { src: "/team/robin-zhou.png" },
  "arfan pasha": { src: "/team/arfan-pasha.webp", pos: "50% 18%" },
  "aljer almazan": { src: "/team/aljer-almazan.webp", pos: "50% 6%", scale: 1 },
  "smaran aramballi sandarsh": { src: "/smaran.png", pos: "50% 20%" },
  "amogh bhatta": { src: "/amogh.webp", pos: "50% 15%", scale: 1.25 },
  "mridhula ganesh kumar": { src: "/team/mridhula-ganesh-kumar.webp", pos: "50% 28%", scale: 1.1 },
  "carter chang": { src: "/team/carter-chang.png", pos: "50% 18%", scale: 1.12 },
};

const HIDDEN_TEAM_NAMES = new Set([
  "shreesh basu",
  "robin zhou",
  "shaurya gakhar",
  "sai sanjit reddy vallapureddy",
  "sanju",
  "aidan kwan",
  "aiden kwan",
  "aidan",
  "aiden",
  "aarav goel",
  "arav goel",
  "arav kol",
  "aarav kol",
  "arham desai",
  "arham",
  "krishiv jani",
  "krishiv",
  "agastya sharma",
  "agastya",
]);

function isHiddenTeamName(name: string): boolean {
  const key = name.trim().toLowerCase();
  if (HIDDEN_TEAM_NAMES.has(key)) return true;
  const first = key.split(/\s+/)[0];
  return first === "aidan" || first === "aiden";
}

function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 2 && /[a-zA-Z]/.test(trimmed) && !/^\d+$/.test(trimmed);
}

function getHeadshot(name: string): Headshot | undefined {
  const key = name.trim().toLowerCase();
  if (HEADSHOTS[key]) return HEADSHOTS[key];
  for (const [k, v] of Object.entries(HEADSHOTS)) {
    if (key.startsWith(k.split(" ")[0]) || k.startsWith(key.split(" ")[0])) return v;
  }
  return undefined;
}

function HeadshotImage({
  src,
  alt,
  name,
}: {
  src: string;
  alt: string;
  name?: string;
}) {
  const hs = name ? getHeadshot(name) : undefined;
  const objectPosition = hs?.pos ?? DEFAULT_HEADSHOT_POS;
  const scale = hs?.scale ?? DEFAULT_HEADSHOT_SCALE;

  return (
    <img
      src={hs?.src ?? src}
      alt={alt}
      className="h-full w-full object-cover grayscale"
      style={{ objectPosition, transform: `scale(${scale})` }}
    />
  );
}

type Volunteer = { id: string; name: string; interest?: string | null };

const PYTHON_TEAM_INTERESTS = new Set(["Python Mentor", "Python Team Member"]);
const RECRUITMENT_TEAM_INTERESTS = new Set(["Recruitment Team Member"]);

function VolunteerGrid({ volunteers, startDelay = 0 }: { volunteers: Volunteer[]; startDelay?: number }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {volunteers.map((v, i) => {
        const hs = getHeadshot(v.name);
        return (
          <motion.div
            key={v.id}
            {...fadeUp(startDelay + i * 0.03)}
            className="flex flex-col items-center text-center"
          >
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
              {hs ? (
                <HeadshotImage src={hs.src} alt={v.name} name={v.name} />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-4xl font-bold text-muted-foreground">
                    {v.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <h3 className="mt-3 text-sm font-bold leading-snug">{v.name}</h3>
            {v.interest && (
              <p className="mt-0.5 text-xs text-muted-foreground">{v.interest}</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function MemberGrid({ members, startDelay = 0 }: { members: TeamMember[]; startDelay?: number }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
      {members.map((member, i) => (
        <motion.div
          key={member.id}
          {...fadeUp(startDelay + i * 0.05)}
          className="flex flex-col items-center text-center"
        >
          <div className="aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
            {member.img || getHeadshot(member.name) ? (
              <HeadshotImage src={member.img ?? ""} alt={member.name} name={member.name} />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-4xl font-bold text-muted-foreground">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h3 className="mt-3 text-sm font-bold leading-snug">{member.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{member.title}</p>
        </motion.div>
      ))}
    </div>
  );
}

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [{ title: "Team — CodeStarters" }],
  }),
  component: TeamPage,
});

function isSectionInterest(interest: string | null | undefined, interests: Set<string>): boolean {
  const value = interest?.trim();
  return Boolean(value && interests.has(value));
}

function TeamPage() {
  const [pythonTeam, setPythonTeam] = useState<Volunteer[] | null>(null);
  const [recruitmentTeam, setRecruitmentTeam] = useState<Volunteer[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/team");
        const data = await res.json().catch(() => null);
        if (!res.ok || !Array.isArray(data)) {
          setPythonTeam([]);
          setRecruitmentTeam([]);
          return;
        }
        const eligible = data.filter(
          (v: Volunteer) =>
            isValidName(v.name) &&
            !FEATURED_TEAM_NAMES.has(v.name.trim().toLowerCase()) &&
            !isHiddenTeamName(v.name),
        );
        setPythonTeam(
          eligible.filter((v: Volunteer) => isSectionInterest(v.interest, PYTHON_TEAM_INTERESTS)),
        );
        setRecruitmentTeam(
          eligible.filter((v: Volunteer) => isSectionInterest(v.interest, RECRUITMENT_TEAM_INTERESTS)),
        );
      } catch {
        setPythonTeam([]);
        setRecruitmentTeam([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

        <motion.div {...fadeUp(0)} className="mb-16 text-center">
          <p className="mb-4 text-xs uppercase tracking-[3px] text-muted-foreground">Our Team</p>
          <h1 className="mb-4 font-serif text-5xl italic lg:text-6xl">Everyone on the team</h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Passionate high schoolers building the future of CS education and local business tech.
          </p>
        </motion.div>

        {DEPARTMENTS.map((department, departmentIndex) => {
          const members = department.memberIds
            .map((id) => MEMBERS[id])
            .filter((member): member is TeamMember => Boolean(member));
          const extras =
            department.label === "Python Team" && pythonTeam
              ? pythonTeam.map((volunteer) => ({
                  id: volunteer.id,
                  name: volunteer.name,
                  title: volunteer.interest ?? "",
                  img: getHeadshot(volunteer.name)?.src,
                }))
              : [];
          const roster = [...members, ...extras];
          if (roster.length === 0) return null;

          return (
            <div key={department.label} className="mb-20">
              <p className="mb-8 text-xs font-bold uppercase tracking-[3px] text-muted-foreground">
                {department.label}
              </p>
              <MemberGrid members={roster} startDelay={departmentIndex * 0.04} />
            </div>
          );
        })}

        {!loading && recruitmentTeam && recruitmentTeam.length > 0 && (
          <div className="mb-20">
            <p className="mb-8 text-xs font-bold uppercase tracking-[3px] text-muted-foreground">
              Recruitment Team
            </p>
            <VolunteerGrid volunteers={recruitmentTeam} />
          </div>
        )}
      </div>
    </div>
  );
}
