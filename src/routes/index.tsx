import { CodeStartersLogo } from "@/assets/logo";
import { OPEN_ROLE_GROUPS, getVolunteerGroupBySlug, type RoleAccent } from "@/lib/open-roles";
import { VolunteerForm } from "@/components/VolunteerForm";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, MotionValue, useMotionValue, useTransform } from "framer-motion";
import Hls from "hls.js";
import {
  ArrowRight,
  Check,
  Clock,
  HeartHandshake,
  Instagram,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const BUILD_NEEDS = [
  { article: "a", word: "website" },
  { article: "an", word: "agent" },
  { article: "a", word: "tool" },
  { article: "an", word: "app" },
] as const;

function RotatingNeedWord() {
  const [index, setIndex] = useState(0);
  const sizerRef = useRef<HTMLSpanElement>(null);
  const [wordWidth, setWordWidth] = useState<number | "auto">("auto");
  const { article, word } = BUILD_NEEDS[index];

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % BUILD_NEEDS.length);
    }, 2300);
    return () => window.clearInterval(id);
  }, []);

  useLayoutEffect(() => {
    const el = sizerRef.current;
    if (!el) return;
    const update = () => setWordWidth(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [word]);

  return (
    <>
      <motion.span layout className="inline-block" transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
        {article}
      </motion.span>{" "}
      <span className="inline-flex items-baseline overflow-visible whitespace-nowrap align-baseline">
        <span className="relative inline-flex overflow-visible align-baseline [perspective:900px]">
          <span
            ref={sizerRef}
            className="invisible pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap px-[0.12em] font-serif italic leading-[1.4]"
            aria-hidden
          >
            {word}
          </span>
          <motion.span
            className="relative inline-flex overflow-visible align-baseline"
            initial={false}
            animate={{ width: wordWidth }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={word}
                layout
                initial={{ rotateX: 80, y: "0.35em", opacity: 0 }}
                animate={{ rotateX: 0, y: 0, opacity: 1 }}
                exit={{ rotateX: -80, y: "-0.35em", opacity: 0 }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block origin-center overflow-visible whitespace-nowrap px-[0.12em] py-[0.18em] font-serif italic leading-[1.4]"
                style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
              >
                {word}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        </span>
        ?
      </span>
    </>
  );
}

const desktopNavLinks = [
  ["Home", "#home"],
  ["Programs", "#programs"],
  ["Mission", "#mission"],
  ["Events", "#events"],
  ["Volunteer", "#volunteer"],
  ["Business", "#business"],
  ["Team", "#team"],
  ["Partnerships", "#partnerships"],
  ["Sponsors", "#sponsors"],
  ["Donate", "#donate"],
];

const mobileNavLinks = desktopNavLinks;

interface ProgramItem {
  img: string;
  name: string;
  desc: string;
  bullets: string[];
  badge?: string;
}

const programs: ProgramItem[] = [
  {
    img: "/cs-education.png",
    name: "CS & AI Education",
    desc: "Our volunteers teach foundational and advanced topics to equip younger students with the skills they need for the future.",
    bullets: [
      "CS fundamentals",
      "Introduction to AI",
      "AI Literacy & Safety",
      "Web development basics",
    ],
  },
  {
    img: "/free-websites.png",
    name: "Free Websites, Tools & Agents",
    desc: "We build professional websites, internal tools, and AI agents at no cost, managed entirely by student developers gaining real-world experience.",
    bullets: ["Websites", "Custom tools", "AI agents", "Businesses & nonprofits"],
  },
  {
    img: "/ai-literacy.png",
    name: "AI Development & Agent Engineering",
    desc: "A zero-to-100 path into modern AI development where students learn to build useful agents, understand how the stack works, and use these tools responsibly.",
    bullets: [
      "OpenClaw + Hermes",
      "Agent workflows + OpenCode",
      "From beginner to real AI projects",
      "Future-ready AI skills",
    ],
  },
];

const featuredTeam = [
  { name: "Smaran Aramballi Sandarsh", role: "Founder & President", img: "/smaran.png" },
  { name: "Reyansh Nankani", role: "Founder & Vice-President", img: "/team/reyansh-nankani.png" },
  { name: "Pranav C", role: "Founder & Head of AI, Finance, and Legal", img: "/team/pranav-c.png" },
];

interface SponsorItem {
  name: string;
  url?: string;
  img?: string;
  fitClass?: string;
  imgClass?: string;
  cardClass?: string;
  cardPadClass?: string;
}

const sponsors: SponsorItem[] = [
  {
    name: "CodeCrafters",
    url: "https://codecrafters.io",
    img: "/sponsors/codecrafters.svg",
    fitClass: "h-16 max-w-[90%]",
  },
  {
    name: "Gen.xyz",
    url: "https://gen.xyz",
    img: "/sponsors/genxyz.png",
    fitClass: "h-14 max-w-[88%]",
  },
  {
    name: "Medo",
    url: "https://medo.com",
    img: "/sponsors/medo.png",
    fitClass: "h-14 max-w-[86%]",
  },
  {
    name: "Featherless AI",
    url: "https://featherless.ai",
    img: "/sponsors/featherless.png",
    fitClass: "h-[4.5rem] max-w-[94%]",
  },
  { name: "n8n", url: "https://n8n.io", img: "/sponsors/n8n.png", fitClass: "h-16 max-w-[88%]" },
  {
    name: "InsForge",
    url: "https://insforge.dev/",
    img: "/sponsors/insoforge.svg",
    fitClass: "h-20 max-w-[72%]",
  },
  {
    name: "Exea Labs",
    img: "/sponsors/exea-labs.png",
    imgClass: "",
    fitClass: "h-[8rem] max-w-full",
    cardPadClass: "p-1",
  },
  {
    name: "YRI Fellowship",
    url: "https://www.yriscience.com/",
    img: "/sponsors/yri.avif",
    imgClass: "",
    fitClass: "h-[4.5rem] max-w-[90%]",
  },
  {
    name: "Publick",
    url: "https://publick.xyz",
    img: "/sponsors/publick.png",
    fitClass: "h-[4.75rem] max-w-[96%]",
  },
  {
    name: "Guild.ai",
    url: "https://www.guild.ai/",
    img: "/sponsors/guild-ai.png",
    fitClass: "h-[6rem] max-w-full",
  },
  {
    name: "Rork",
    url: "https://rork.com",
    img: "/sponsors/rork.avif",
    fitClass: "h-14 max-w-[88%]",
  },
  {
    name: "Render",
    url: "https://render.com",
    img: "/sponsors/adrender.avif",
    fitClass: "h-14 max-w-[88%]",
  },
];

const partners = [
  {
    name: "Resera",
    url: "https://discord.gg/CywxnesCpm",
    img: "/partners/resera.webp",
    fitClass: "h-[5.5rem] max-w-[80%]",
  },
  {
    name: "LovHack",
    url: "https://lovhack.dev",
    img: "/partners/lovhack.png",
    fitClass: "h-[6.5rem] max-w-[92%]",
  },
  {
    name: "Master Guide",
    img: "/partners/master-guide.webp",
    fitClass: "h-[6.75rem] max-w-[92%]",
  },
];

const roleAccentStyles: Record<
  RoleAccent,
  { icon: string; card: string }
> = {
  sky: {
    icon: "text-sky-300 bg-sky-400/10 border-sky-400/20",
    card: "border-sky-400/20 hover:border-sky-400/35",
  },
  violet: {
    icon: "text-violet-300 bg-violet-400/10 border-violet-400/20",
    card: "border-violet-400/20 hover:border-violet-400/35",
  },
  emerald: {
    icon: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    card: "border-emerald-400/20 hover:border-emerald-400/35",
  },
  amber: {
    icon: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    card: "border-amber-400/20 hover:border-amber-400/35",
  },
  orange: {
    icon: "text-orange-300 bg-orange-400/10 border-orange-400/20",
    card: "border-orange-400/20 hover:border-orange-400/35",
  },
  rose: {
    icon: "text-rose-300 bg-rose-400/10 border-rose-400/20",
    card: "border-rose-400/20 hover:border-rose-400/35",
  },
} as const;

const missionWords =
  "Make computer science and AI accessible to every young student, and help every small business build a strong online presence.".split(
    " ",
  );

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CodeStarters | Empowering the Next Generation" },
      {
        name: "description",
        content:
          "Student-led initiative teaching CS and AI to younger students, building free websites for businesses, and hosting classes and events.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return <CodeStartersHomePage />;
}

function CodeStartersHomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [openRole, setOpenRole] = useState<string | undefined>();
  const [openRoleGroup, setOpenRoleGroup] = useState<string | undefined>();
  const [scrolled, setScrolled] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number | null>(25);
  const [liveTeam, setLiveTeam] = useState(featuredTeam);
  const ctaVideoRef = useRef<HTMLVideoElement>(null);
  const missionRef = useRef<HTMLElement>(null);
  const missionProgress = useMotionValue(0);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.members) && data.members.length > 0) {
          const leadership = data.members.filter((m: { category_id: string }) => m.category_id === "leadership");
          const listToUse = leadership.length > 0 ? leadership : data.members.slice(0, 3);
          setLiveTeam(
            listToUse.map((m: { name: string; role: string; image_url?: string }) => ({
              name: m.name,
              role: m.role,
              img: m.image_url || "/smaran.png",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const mailto = useMemo(() => {
    const subject = encodeURIComponent("CodeStarters volunteer interest");
    return `mailto:codestarters26@gmail.com?subject=${subject}`;
  }, []);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("volunteer");
    const group = getVolunteerGroupBySlug(slug);
    if (!group) return;
    setOpenRole(undefined);
    setOpenRoleGroup(group.category);
    setShowVolunteerForm(true);
  }, []);

  const openVolunteerForm = (role?: string, group?: string) => {
    setOpenRole(role);
    setOpenRoleGroup(group);
    setShowVolunteerForm(true);
  };

  const closeVolunteerForm = () => {
    setShowVolunteerForm(false);
    setOpenRole(undefined);
    setOpenRoleGroup(undefined);
  };

  useEffect(() => {
    const video = ctaVideoRef.current;
    const src = "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";
    if (!video) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, []);

  useEffect(() => {
    const section = missionRef.current;
    if (!section) return;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      missionProgress.set(progress);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [missionProgress]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitBusinessRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = encodeURIComponent(
      [
        `Business: ${form.get("business")}`,
        `Owner: ${form.get("owner")}`,
        `Email: ${form.get("email")}`,
        `Phone: ${form.get("phone") || "Not provided"}`,
        `Category: ${form.get("category")}`,
        `About: ${form.get("about") || "Not provided"}`,
        `Needs: ${form.get("needs") || "Not provided"}`,
      ].join("\n"),
    );
    window.location.href = `mailto:codestarters26@gmail.com?subject=Free%20Build%20Request&body=${body}`;
    setFormSent(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav
        className={`fixed z-50 flex items-center justify-between nav-glass transition-all duration-300 ${scrolled ? "left-3 right-3 top-2 rounded-xl px-4 py-2 md:left-6 md:right-6 md:px-5" : "left-3 right-3 top-3 rounded-2xl px-4 py-3 md:left-10 md:right-10 md:top-6 md:px-6 md:py-4"}`}
      >
        <a href="#home" className="flex items-center gap-3" aria-label="CodeStarters home">
          <CodeStartersLogo size={28} white />
          <span className="text-lg font-bold">CodeStarters</span>
        </a>

        <div className="hidden items-center gap-1 text-sm xl:flex">
          {desktopNavLinks.map(([label, href], index) => (
            <div key={label} className="flex items-center">
              <a
                href={href}
                className="px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
              {index < desktopNavLinks.length - 1 && (
                <span className="text-muted-foreground/40">•</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://www.instagram.com/codestarters_cupertino/"
            target="_blank"
            rel="noreferrer"
            className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105"
            aria-label="Instagram"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full xl:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed left-3 right-3 top-20 z-40 rounded-2xl border border-border bg-card p-4 xl:hidden"
          >
            {mobileNavLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                {label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openVolunteerForm();
              }}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background"
            >
              Join the team
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <section
          id="home"
          className="relative flex min-h-screen items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover opacity-55 grayscale"
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-[1] h-64 bg-gradient-to-t from-background to-transparent" />

          <div className="relative z-10 mx-auto max-w-5xl px-6 pt-16 text-center md:pt-20">
            <motion.h1
              {...fadeUp(0)}
              className="mb-5 text-5xl font-medium tracking-[-2px] md:text-7xl lg:text-8xl"
            >
              Teaching <span className="font-serif font-normal italic">AI</span> and CS
            </motion.h1>
            <motion.p
              {...fadeUp(0.1)}
              className="text-hero-subtitle mx-auto mb-12 max-w-2xl text-lg"
            >
              Student-led initiative teaching CS and AI to younger students while helping small
              businesses with free websites, tools, and agents.
            </motion.p>
            <motion.div
              {...fadeUp(0.2)}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href="#programs"
                className="font-medium text-white/70 hover:text-white transition-colors border-b border-white/30 hover:border-white/70 pb-0.5"
              >
                See our programs →
              </a>
              <motion.button
                onClick={() => openVolunteerForm()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-full bg-white px-8 py-3 font-medium text-black sm:w-auto"
              >
                JOIN US
              </motion.button>
            </motion.div>
          </div>
        </section>

        <section id="programs" className="px-6 pb-6 pt-28 md:pb-9 md:pt-64">
          <motion.h2
            {...fadeUp(0)}
            className="mb-6 text-center text-4xl sm:text-5xl md:text-7xl lg:text-8xl"
          >
            Three core <span className="font-serif italic">programs.</span>
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="mx-auto mb-14 max-w-2xl text-center text-lg text-muted-foreground md:mb-24"
          >
            We make computer science and AI accessible to young students and help businesses
            build a stronger online presence.
          </motion.p>

          <div className="mx-auto mb-20 grid max-w-6xl gap-12 md:grid-cols-3 md:gap-8">
            {programs.map((program, index) => (
              <motion.article
                key={program.name}
                {...fadeUp(0.2 + index * 0.1)}
                whileHover={{ y: -8 }}
                className={
                  program.badge
                    ? "rounded-[28px] border border-white/15 bg-white/[0.03] px-5 py-6 text-center shadow-[0_0_40px_rgba(125,211,252,0.12)]"
                    : "text-center"
                }
              >
                <div
                  className={`mx-auto mb-6 h-[200px] w-[200px] overflow-hidden rounded-2xl ${program.badge ? "ring-1 ring-sky-300/40 shadow-[0_0_35px_rgba(56,189,248,0.18)]" : ""}`}
                >
                  <img
                    src={program.img}
                    alt={program.name}
                    className="h-full w-full object-cover grayscale"
                  />
                </div>
                {program.badge && (
                  <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded-full border border-sky-300/35 bg-sky-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-100">
                      {program.badge}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                      Zero to 100 AI
                    </span>
                  </div>
                )}
                <h3 className="mb-2 text-base font-semibold">{program.name}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{program.desc}</p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {program.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center justify-center gap-2">
                      <Check className="h-3.5 w-3.5 text-foreground/70" /> {bullet}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="mission" ref={missionRef} className="h-[300vh] md:h-[500vh] relative">
          <div className="sticky top-0 h-screen bg-black flex items-center justify-center overflow-hidden">
            <div className="mx-auto max-w-5xl px-6 text-center">
              <p className="text-2xl font-medium leading-relaxed tracking-[-1px] md:text-4xl lg:text-5xl text-white">
                {missionWords.map((word, index) => (
                  <RevealWord
                    key={`${word}-${index}`}
                    index={index}
                    total={missionWords.length}
                    progress={missionProgress}
                    highlight={["computer", "science", "AI", "business"].includes(
                      word.replace(/[,.]/g, ""),
                    )}
                  >
                    {word}
                  </RevealWord>
                ))}
              </p>
            </div>
          </div>
        </section>

        <section id="events" className="overflow-hidden border-t border-border/30 py-20 md:py-44">
          <motion.p
            {...fadeUp(0)}
            className="mb-6 text-center text-xs uppercase tracking-[3px] text-muted-foreground"
          >
            Events
          </motion.p>
          <motion.h2 {...fadeUp(0.1)} className="mb-10 text-center text-4xl md:text-6xl">
            Events for <span className="font-serif italic">student builders</span>
          </motion.h2>
          <motion.div {...fadeUp(0.2)} className="relative mx-auto mb-10 max-w-5xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="aspect-video w-full rounded-2xl object-cover grayscale md:aspect-[3/1]"
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4"
            />
          </motion.div>
          <motion.div {...fadeUp(0.3)} className="flex justify-center px-6">
            <a
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3 font-medium text-background"
            >
              See events <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </section>

        <section id="volunteer" className="border-t border-border/30 px-6 py-20 md:py-44">
          <motion.div {...fadeUp(0)} className="mx-auto max-w-5xl text-center">
            <p className="mb-6 text-xs uppercase tracking-[3px] text-muted-foreground">
              Join the team
            </p>
            <h2 className="text-4xl md:text-6xl">
              Open roles across <span className="font-serif italic">the team</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              We&apos;re hiring for leadership, teaching, marketing, and fundraising. Every role
              logs volunteer hours. You get real experience — teaching, running events, posting,
              or talking to sponsors — that belongs on a resume and college apps.
            </p>
            <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-center">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-100">
                <MapPin className="h-4 w-4" />
                Bay Area high schoolers only
              </p>
              <p className="text-sm leading-relaxed text-amber-50/85">
                Every hire must be a current high school student (grades 9–12) who lives in the
                San Francisco Bay Area. These are in-person roles. Remote, college, and
                out-of-area applications will not be reviewed.
              </p>
            </div>
          </motion.div>

          <div className="mx-auto mt-16 max-w-6xl space-y-14">
            {OPEN_ROLE_GROUPS.map((group, gi) => (
              <motion.div key={group.category} {...fadeUp(0.12 + gi * 0.08)}>
                <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{group.category}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-300/80">
                    Now hiring
                  </span>
                </div>
                <div
                  className={`grid gap-5 ${
                    group.roles.length === 1
                      ? "md:grid-cols-1 md:max-w-xl"
                      : "md:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {group.roles.map((role, ri) => {
                    const Icon = role.icon;
                    const accent = roleAccentStyles[role.accent];
                    return (
                      <motion.article
                        key={role.name}
                        {...fadeUp(0.18 + gi * 0.08 + ri * 0.04)}
                        whileHover={{ y: -4 }}
                        className={`flex h-full flex-col rounded-2xl border bg-white/[0.02] p-6 transition-colors ${accent.card}`}
                      >
                        <div className="mb-5 flex items-start justify-between gap-3">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accent.icon}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                            Open
                          </span>
                        </div>
                        <h4 className="mb-2 text-lg font-semibold text-white">{role.name}</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{role.desc}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-[0.16em] text-white/70">
                          <p className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {role.hours}
                          </p>
                          <p className="inline-flex items-center gap-1.5 text-amber-100">
                            <MapPin className="h-3.5 w-3.5" />
                            Bay Area · in person
                          </p>
                        </div>
                        <div className="mt-5 space-y-4">
                          <div>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                              Expect
                            </p>
                            <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                              {role.expectations.map((item) => (
                                <li key={item} className="flex gap-2">
                                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                              You get
                            </p>
                            <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                              {role.returns.map((item) => (
                                <li key={item} className="flex gap-2">
                                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-300/70" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-auto pt-6">
                          <button
                            type="button"
                            onClick={() => openVolunteerForm(role.name)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10"
                          >
                            Apply for this role
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeUp(0.55)} className="mt-14 flex justify-center">
            <motion.button
              type="button"
              onClick={() => openVolunteerForm()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-10 py-3.5 font-medium text-background"
            >
              General application
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </section>

        <section id="business" className="border-t border-border/30 px-6 py-20 md:py-44">
          <motion.div
            {...fadeUp(0)}
            className="mx-auto grid max-w-5xl gap-10 overflow-visible md:grid-cols-[0.85fr_1.15fr]"
          >
            <div className="min-w-0 overflow-visible">
              <HeartHandshake className="mb-8 h-12 w-12 text-foreground/80" />
              <p className="mb-6 text-xs uppercase tracking-[3px] text-muted-foreground">
                Websites · Agents · Tools
              </p>
              <h2 className="overflow-visible text-4xl leading-[1.25] md:text-6xl md:leading-[1.22]">
                Need <RotatingNeedWord />
              </h2>
              <p className="mt-5 text-pretty text-muted-foreground">
                We build free websites, tools, and agents for businesses. Fill out the form and
                tell us what you actually need.
              </p>
            </div>
            <form onSubmit={submitBusinessRequest} className="grid min-w-0 gap-4 sm:grid-cols-2">
              <input
                name="business"
                required
                placeholder="Business Name *"
                className="rounded-xl bg-input px-4 py-3 outline-none ring-ring/30 focus:ring-2"
              />
              <input
                name="owner"
                required
                placeholder="Owner Name *"
                className="rounded-xl bg-input px-4 py-3 outline-none ring-ring/30 focus:ring-2"
              />
              <input
                name="email"
                required
                type="email"
                placeholder="Email *"
                className="rounded-xl bg-input px-4 py-3 outline-none ring-ring/30 focus:ring-2"
              />
              <input
                name="phone"
                placeholder="Phone"
                className="rounded-xl bg-input px-4 py-3 outline-none ring-ring/30 focus:ring-2"
              />
              <select
                name="category"
                required
                className="rounded-xl bg-input px-4 py-3 outline-none ring-ring/30 focus:ring-2"
              >
                <option value="">Select a category</option>
                <option>Restaurant / Cafe</option>
                <option>Retail / Shop</option>
                <option>Service Provider</option>
                <option>Nonprofit</option>
                <option>Other</option>
              </select>
              <input
                name="about"
                placeholder="About your business"
                className="rounded-xl bg-input px-4 py-3 outline-none ring-ring/30 focus:ring-2"
              />
              <textarea
                name="needs"
                placeholder="What do you need?"
                className="min-h-28 rounded-xl bg-input px-4 py-3 outline-none ring-ring/30 focus:ring-2 sm:col-span-2"
              />
              <button className="rounded-full bg-foreground px-8 py-3 font-medium text-background sm:col-span-2">
                Request a free build
              </button>
              {formSent && (
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  Opening your email app with the request details.
                </p>
              )}
            </form>
          </motion.div>
        </section>

        <section id="team" className="border-t border-border/30 px-6 py-20 md:py-32">
          <motion.div {...fadeUp(0)} className="mb-16 text-center">
            <p className="mb-6 text-xs uppercase tracking-[3px] text-muted-foreground">FOUNDERS</p>
            <h2 className="text-4xl md:text-6xl">
              Meet the <span className="font-serif italic">founders</span>
            </h2>
          </motion.div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-3">
            {liveTeam.map((member, index) => (
              <motion.article
                key={member.name}
                {...fadeUp(0.1 + index * 0.08)}
                whileHover={{ y: -6 }}
                className="text-center"
              >
                <img
                  src={member.img}
                  alt={member.name}
                  loading="lazy"
                  className="aspect-square w-full rounded-[22px] object-cover grayscale"
                />
                <h3 className="mt-6 text-lg font-bold leading-tight">{member.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{member.role}</p>
              </motion.article>
            ))}
          </div>
          <motion.div {...fadeUp(0.28)} className="mt-12 text-center">
            <a
              href="/team"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-foreground/5"
            >
              See more
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </section>

        <section id="partnerships" className="border-t border-border/30 px-6 py-20 md:py-32">
          <motion.div {...fadeUp(0)} className="mx-auto max-w-5xl text-center">
            <p className="mb-6 text-xs uppercase tracking-[3px] text-muted-foreground">
              PARTNERSHIPS
            </p>
            <h2 className="text-4xl md:text-6xl">
              Orgs we <span className="font-serif italic">build with</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
              We partner with student communities to teach CS and AI, host events, and ship free
              websites, tools, and agents for businesses.
            </p>
          </motion.div>
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-3">
            {partners.map((partner, index) => {
              const cardClass =
                "liquid-glass flex h-40 items-center justify-center rounded-2xl p-5";
              const logo = (
                <img
                  src={partner.img}
                  alt={partner.name}
                  loading="lazy"
                  className={`object-contain ${partner.fitClass}`}
                />
              );

              return partner.url ? (
                <motion.a
                  key={partner.name}
                  href={partner.url}
                  target="_blank"
                  rel="noreferrer"
                  {...fadeUp(0.1 + index * 0.06)}
                  whileHover={{ scale: 1.04 }}
                  className={cardClass}
                >
                  {logo}
                </motion.a>
              ) : (
                <motion.div
                  key={partner.name}
                  {...fadeUp(0.1 + index * 0.06)}
                  className={cardClass}
                >
                  {logo}
                </motion.div>
              );
            })}
          </div>
          <motion.div {...fadeUp(0.28)} className="mt-12 text-center">
            <p className="mb-5 text-sm text-muted-foreground">
              Want to partner with a student-led nonprofit?
            </p>
            <a
              href="mailto:codestarters26@gmail.com?subject=Partnership"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background transition hover:opacity-90"
            >
              Partner with us
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </section>

        <section id="sponsors" className="border-t border-border/30 px-6 py-20 md:py-32">
          <motion.div {...fadeUp(0)} className="mx-auto max-w-5xl text-center">
            <p className="mb-6 text-xs uppercase tracking-[3px] text-muted-foreground">SPONSORS</p>
            <h2 className="text-4xl md:text-6xl">
              Supported by <span className="font-serif italic">partners</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
              We're grateful to organizations that help us bring CS, AI, and real-world projects to
              students and businesses.
            </p>
          </motion.div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {sponsors.map((sponsor, index) => (
              <motion.a
                key={sponsor.name}
                href={sponsor.url ?? undefined}
                target={sponsor.url ? "_blank" : undefined}
                rel={sponsor.url ? "noreferrer" : undefined}
                {...fadeUp(0.1 + index * 0.04)}
                whileHover={{ scale: 1.04 }}
                className={`liquid-glass flex items-center justify-center rounded-2xl ${sponsor.cardClass ?? "h-36"} ${sponsor.cardPadClass ?? "p-4 sm:p-5"}`}
              >
                {sponsor.img ? (
                  <img
                    src={sponsor.img}
                    alt={sponsor.name}
                    loading="lazy"
                    className={`object-contain ${sponsor.imgClass ?? "brightness-0 invert"} ${sponsor.fitClass ?? "h-14 max-w-[88%]"}`}
                  />
                ) : (
                  <span className="text-lg font-bold">{sponsor.name}</span>
                )}
              </motion.a>
            ))}
          </div>
        </section>

        <section
          id="donate"
          className="relative overflow-hidden border-t border-border/30 px-6 py-20 md:py-44"
        >
          <video
            ref={ctaVideoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 z-[1] bg-background/60" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <motion.div {...fadeUp(0)} className="mb-6 flex justify-center">
                <CodeStartersLogo size={36} white />
              </motion.div>
              <motion.h2 {...fadeUp(0.1)} className="mb-3 font-serif text-4xl italic md:text-5xl">
                Support CodeStarters
              </motion.h2>
              <motion.p {...fadeUp(0.15)} className="text-muted-foreground">
                Every dollar helps us teach CS & AI, host events, and build free websites, tools,
                and agents for businesses.
              </motion.p>
            </div>
            <motion.div
              {...fadeUp(0.2)}
              className="overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <iframe
                src="https://hcb.hackclub.com/donations/start/codestarters"
                className="h-[680px] w-full border-0 sm:h-[580px]"
                title="Donate to CodeStarters"
              />
            </motion.div>
          </div>
        </section>
      </main>

      <VolunteerForm
        isOpen={showVolunteerForm}
        onClose={closeVolunteerForm}
        preselectedRole={openRole}
        preselectedGroup={openRoleGroup}
      />

      <footer className="flex flex-col items-center justify-between gap-4 px-8 py-12 md:flex-row md:px-28">
        <p className="text-sm text-muted-foreground">© 2026 CodeStarters. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a
            href="/events"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Events
          </a>
          <a
            href="/branding"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Brand
          </a>
          <a
            href="mailto:codestarters26@gmail.com"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact
          </a>
          <a
            href="https://www.instagram.com/codestarters_cupertino/"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Instagram
          </a>
        </div>
      </footer>
    </div>
  );
}

function RevealWord({
  children,
  index,
  total,
  progress,
  highlight = false,
}: {
  children: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  highlight?: boolean;
}) {
  const start = 0.05 + (index / total) * 0.8;
  const end = Math.min(0.95, start + 0.12);
  const opacity = useTransform(progress, [start, end], [0.15, 1]);

  return (
    <motion.span style={{ opacity }} className="text-white">
      {children}{" "}
    </motion.span>
  );
}
