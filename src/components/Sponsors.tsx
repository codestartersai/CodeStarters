import { motion } from "framer-motion";
import { ExternalLink, Mail, FileText } from "lucide-react";

const sponsors = [
  { name: "CodeCrafters", url: "https://codecrafters.io/", img: "/sponsors/codecrafters.svg" },
  { name: "Gen.xyz", url: "https://gen.xyz/", img: "/sponsors/genxyz.png" },
  { name: "Medo", url: "https://medo.com/", img: "/sponsors/medo.png" },
  { name: "Featherless AI", url: "https://featherless.ai/", img: "/sponsors/featherless.png" },
  { name: "n8n", url: "https://n8n.io/", img: "/sponsors/n8n.png" },
  { name: "Publick", url: "https://publick.xyz/", img: "/sponsors/publick.png" },
  { name: "Guild.ai", url: "https://www.guild.ai/" },
  { name: "Rork", url: "https://rork.com/", img: "/sponsors/rork.avif" },
  { name: "Render", url: "https://render.com", img: "/sponsors/adrender.avif" },
  {
    name: "Better Design",
    url: "https://better-design.com/",
    img: "/sponsors/better-design.svg",
  },
];

export function Sponsors() {
  return (
    <section id="sponsors" className="relative py-32 px-6 bg-red-950 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.38),transparent_52%)]" />
      <div className="max-w-6xl mx-auto text-center">
        <span className="text-red-500 text-sm font-medium tracking-widest uppercase">
          Our Sponsors
        </span>
        <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
          Backed by Builders
        </h2>

        {/* Sponsor logos */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 sm:gap-6">
          {sponsors.map((s, i) => (
            <motion.a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="group relative flex items-center justify-center w-36 sm:w-44 h-20 sm:h-24 rounded-xl bg-white/95 border border-white/30 hover:border-white transition-all overflow-hidden p-4 shadow-2xl shadow-red-950/25"
            >
              {s.img ? (
                <img
                  src={s.img}
                  alt={s.name}
                  loading="lazy"
                  className={`max-w-full object-contain opacity-80 transition-opacity group-hover:opacity-100 ${
                    s.name === "Better Design"
                      ? "h-12 w-12 sm:h-14 sm:w-14 rounded-xl"
                      : "max-h-10"
                  }`}
                />
              ) : (
                <span className="text-xl font-black tracking-tight text-red-950">{s.name}</span>
              )}
            </motion.a>
          ))}
        </div>

        {/* Become a sponsor CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mt-20 p-8 sm:p-12 rounded-2xl bg-[#0A0A0A]/72 border border-white/15 backdrop-blur"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            Become a <span className="text-red-500">Sponsor</span>
          </h3>
          <p className="mt-4 text-gray-400 max-w-lg mx-auto leading-relaxed">
            Help us put on the Bay Area's best high school hackathon. Your sponsorship is
            tax-deductible through our 501(c)(3) fiscal sponsor and directly funds prizes, meals,
            and resources for 200+ student builders.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="mailto:codestarters26@gmail.com?subject=Fire%20Hacks%20Sponsorship"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              <Mail className="w-4 h-4" />
              Get in Touch
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="/firehacks-sponsorship-prospectus.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-gray-300 font-medium hover:border-white/40 hover:text-white transition-all"
            >
              <FileText className="w-4 h-4" />
              View prospectus
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
