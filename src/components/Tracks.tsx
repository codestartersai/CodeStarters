import { motion } from "framer-motion";
import { Brain, Code2, FlaskConical, Sparkles } from "lucide-react";

const tracks = [
  {
    icon: Brain,
    name: "AI Track",
    desc: "Build AI apps, agents, copilots, workflows, model-powered products.",
    sponsors: ["Featherless AI", "Guild.ai", "n8n"],
  },
  {
    icon: Code2,
    name: "Developer Tools Track",
    desc: "Build tools for builders — IDEs, APIs, infra, deployment, coding workflows.",
    sponsors: ["CodeCrafters", "InsForge", "Better Design"],
  },
  {
    icon: FlaskConical,
    name: "Research & Innovation Track",
    desc: "Build technical projects pushing boundaries — new AI applications, scientific tools, experimental systems.",
    sponsors: ["Exea Labs"],
  },
  {
    icon: Sparkles,
    name: "Open Track",
    desc: "Build literally anything. Games, websites, hardware, random ideas, cursed hacks.",
    sponsors: [] as string[],
  },
];

export function Tracks() {
  return (
    <section id="tracks" className="relative py-32 px-6 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto text-center">
        <span className="text-red-500 text-sm font-medium tracking-widest uppercase">
          Build What You Want
        </span>
        <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
          Tracks
        </h2>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
          {tracks.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#1F1F1F] hover:border-red-500/30 transition-all duration-300 flex flex-col"
            >
              <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

              <div className="relative flex flex-col flex-1">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                  <t.icon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">{t.name}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed flex-1">{t.desc}</p>
                {t.sponsors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#1F1F1F]">
                    <p className="text-[0.65rem] uppercase tracking-widest text-red-500 font-semibold mb-1.5">
                      Sponsors
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">{t.sponsors.join(" · ")}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
