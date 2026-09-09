import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const DEFAULT_CORE_TEAM = [
  { name: "Smaran Aramballi Sandarsh", role: "President", img: "/smaran.png" },
  { name: "Amogh Bhatta", role: "Director of Robotics", img: "/amogh.webp" },
  { name: "Sai Sanjit Reddy Vallapureddy", role: "Director of Marketing", img: "/sai.webp" },
];

const DEFAULT_EXTENDED_TEAM = [
  { name: "Reyansh Nankani", role: "UI/UX Designer", img: "/team/reyansh-nankani.png" },
  { name: "Arnav Ghildiyal", role: "Basic CS Mentor", img: "/arnav.webp" },
  { name: "Shaurya Gakhar", role: "CS & AI Instructor", img: "/team/shaurya-gakhar.png" },
  { name: "Robin Zhou", role: "Social Media Manager", img: "/team/robin-zhou.png" },
  { name: "Pranav C", role: "Founder & Head of AI, Finance, and Legal", img: "/team/pranav-c.png" },
  { name: "Michael Cutsail", role: "CS & AI Instructor", img: "/team/michael-cutsail.png" },
];

type MemberItem = {
  name: string;
  role: string;
  img: string;
};

export function Team() {
  const [coreTeam, setCoreTeam] = useState<MemberItem[]>(DEFAULT_CORE_TEAM);
  const [extendedTeam, setExtendedTeam] = useState<MemberItem[]>(DEFAULT_EXTENDED_TEAM);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.members) && data.members.length > 0) {
          const core = data.members
            .filter((m: { category_id: string }) => m.category_id === "leadership")
            .map((m: { name: string; role: string; image_url?: string }) => ({
              name: m.name,
              role: m.role,
              img: m.image_url || "/smaran.png",
            }));

          const extended = data.members
            .filter((m: { category_id: string }) => m.category_id !== "leadership")
            .map((m: { name: string; role: string; image_url?: string }) => ({
              name: m.name,
              role: m.role,
              img: m.image_url || "/arnav.webp",
            }));

          if (core.length > 0) setCoreTeam(core);
          if (extended.length > 0) setExtendedTeam(extended);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="team" className="relative py-32 px-6 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-brand-500 text-sm font-medium tracking-widest uppercase">
            The Crew
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            Meet the Team
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
            A group of passionate high schoolers using computer science as a force for good.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {coreTeam.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-2xl bg-[#141414] border border-[#1F1F1F] overflow-hidden hover:border-brand-500/40 transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden bg-[#1A1A1A]">
                <img
                  src={m.img}
                  alt={m.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <div className="font-bold text-white text-sm leading-tight">{m.name}</div>
                <div className="text-xs text-brand-400 mt-1 font-medium">{m.role}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {extendedTeam.length > 0 && (
          <div className="mt-24">
            <div className="mb-12 text-center">
              <span className="text-brand-500 text-sm font-medium tracking-widest uppercase">
                Extended Team
              </span>
              <h3 className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight">
                More people making the mission happen
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
              {extendedTeam.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="text-center group"
                >
                  <div className="aspect-square w-full rounded-[22px] overflow-hidden bg-[#141414] border border-[#1F1F1F] mb-4">
                    <img
                      src={m.img}
                      alt={m.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white leading-tight">
                    {m.name}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">{m.role}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
