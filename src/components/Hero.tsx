import { motion } from "framer-motion";
import { ArrowRight, ArrowDown, Ticket, Flame } from "lucide-react";
import { FIREHACKS_EVENT_DATE_LABEL, FIREHACKS_VENUE } from "@/lib/firehacks/event";

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Volcano background image */}
      <div className="absolute inset-0">
        <img src="/volcano-bg.jpg" alt="" className="w-full h-full object-cover" />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-[#0A0A0A]/70 to-[#0A0A0A]" />
        {/* Red accent glow from bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-red-900/20 to-transparent" />
      </div>

      {/* Floating ember particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-red-500"
            style={{
              left: `${55 + ((i * 19) % 25)}%`,
              bottom: "25%",
            }}
            animate={{
              y: [0, -300 - i * 40],
              x: [0, i % 3 === 0 ? 40 : -30],
              opacity: [0, 0.7, 0],
              scale: [0.5, 1, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 mb-6"
        >
          <span className="text-red-500 text-sm font-medium tracking-wide uppercase">
            Bay Area's Premier High School Hackathon
          </span>
          <span className="text-red-500/50">•</span>
          <span className="text-gray-500 text-sm">Bay Area</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-7xl sm:text-8xl md:text-[10rem] font-black leading-[0.85] tracking-tighter"
        >
          <span className="text-red-500 block">FIRE</span>
          <span className="text-white/90 block">HACKS</span>
        </motion.h1>

        {/* Date badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-gray-300 font-medium">{FIREHACKS_EVENT_DATE_LABEL}</span>
          <span className="text-gray-600">·</span>
          <span className="text-sm text-gray-400 font-medium">{FIREHACKS_VENUE}</span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          A full day of building, learning, and shipping. Join 200+ high school hackers for the Bay
          Area's most electric hackathon.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="https://luma.com/event/evt-teYwe8vJ6Eqne8d"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
          >
            <Ticket className="w-4 h-4" />
            Register for Event
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="https://discord.gg/utUNdDz3"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-gray-300 font-medium hover:border-white/40 hover:text-white transition-all"
          >
            Join Discord
          </a>
        </motion.div>

        {/* Secondary CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 flex flex-wrap justify-center gap-4"
        >
          <a
            href="#sponsors"
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Become a Sponsor
          </a>
          <a
            href="/firehacks-sponsorship-prospectus.pdf"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            View prospectus
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-gray-600"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
