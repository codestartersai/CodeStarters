import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Flame, Clock, Trophy, DollarSign } from "lucide-react";

function Counter({
  to,
  suffix = "",
  prefix = "",
}: {
  to: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => prefix + Math.floor(v).toLocaleString() + suffix);
  useEffect(() => {
    if (inView) animate(mv, to, { duration: 2, ease: "easeOut" });
  }, [inView, to, mv]);
  return <motion.span ref={ref}>{rounded}</motion.span>;
}

const stats = [
  { icon: Flame, value: 300, suffix: "", label: "Hackers", prefix: "200–" },
  { icon: Clock, value: 1, suffix: " day", label: "Of Building" },
  { icon: Trophy, value: 30, suffix: "K+", label: "In Prizes", prefix: "$" },
  { icon: DollarSign, value: 100, suffix: "%", label: "Free" },
];

export function About() {
  const [visibleItems, setVisibleItems] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (inView) {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setVisibleItems(i);
        if (i >= stats.length) clearInterval(interval);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [inView]);

  return (
    <section id="about" className="relative py-32 px-6 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <div className="text-center mb-16">
          <span className="text-red-500 text-sm font-medium tracking-widest uppercase">
            About the Event
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            What is <span className="text-red-500">Fire Hacks</span>?
          </h2>
        </div>

        {/* Description */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <p className="text-lg text-gray-400 leading-relaxed">
            Fire Hacks is a one-day hackathon designed for high school builders who want to ship
            real projects, learn from mentors, and connect with the Bay Area's next generation of
            engineers.
          </p>
          <p className="mt-4 text-lg text-gray-400 leading-relaxed">
            Whether you're building your first app or training your tenth model, Fire Hacks gives
            you the space, resources, and community to create something you're proud of — in one
            packed day.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Hosted by{" "}
            <a
              href="https://codestarters.org"
              target="_blank"
              rel="noreferrer"
              className="text-red-500 hover:underline"
            >
              CodeStarters
            </a>
            , a student-led 501(c)(3) fiscally sponsored nonprofit.
          </p>
        </div>

        {/* Stats grid */}
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              animate={visibleItems > i ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="relative group p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#1F1F1F] hover:border-red-500/30 transition-all duration-500 overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-white">
                  <Counter to={s.value} suffix={s.suffix} prefix={s.prefix} />
                </div>
                <div className="mt-2 text-sm text-gray-500 font-medium">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why we're different */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 max-w-2xl mx-auto p-8 rounded-2xl bg-[#141414] border border-[#1F1F1F]"
        >
          <h3 className="text-lg font-mono text-red-500 mb-4">// Why we're different</h3>
          <ul className="space-y-3">
            {[
              "Software-only: web, mobile, AI/ML — no hardware constraints",
              "A full day of focused building time",
              "Workshops on AI/ML, full-stack dev, and product design",
              "Mentors from industry and university on site all day",
              "Full meals, snacks, and caffeine provided",
              "100% free — no registration fee, ever",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-400 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
