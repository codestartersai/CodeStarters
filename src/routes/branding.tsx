import { CodeStartersLogo, FireHacksLogo } from "@/assets/logo";
import {
  FIREHACKS_EVENT_DATE_LABEL,
  FIREHACKS_VENUE,
} from "@/lib/firehacks/event";
import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Download, X } from "lucide-react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

const MISSION =
  "Make computer science and AI accessible to every young student, and help every small business build a strong online presence.";

const TAGLINE = "Empowering the Next Generation";

const CODESTARTERS_COLORS = [
  { name: "Background", hex: "#0A0A0A", usage: "Primary page background" },
  { name: "Foreground", hex: "#FFFFFF", usage: "Headings and primary text" },
  { name: "Muted", hex: "#A6A6A6", usage: "Secondary text, captions" },
  { name: "Accent Sky", hex: "#38BDF8", usage: "Highlights, badges, links" },
  { name: "Card", hex: "#0D0D0D", usage: "Cards and elevated surfaces" },
  { name: "Border", hex: "#333333", usage: "Dividers and outlines" },
];

const FIREHACKS_COLORS = [
  { name: "Fire Red", hex: "#EF4444", usage: "Primary accent, CTAs, logo" },
  { name: "Background", hex: "#0A0A0A", usage: "Page background" },
  { name: "Card", hex: "#161616", usage: "Section cards" },
  { name: "Text", hex: "#F4F4F5", usage: "Primary headings" },
  { name: "Muted", hex: "#6B6B73", usage: "Body copy, labels" },
];

const LOGO_ASSETS = [
  {
    name: "CodeStarters Logo",
    path: "/cs-logo.png",
    format: "PNG",
    description: "Primary mark for CodeStarters communications.",
  },
  {
    name: "Fire Hacks Icon",
    path: "/firehacks-icon.png",
    format: "PNG",
    description: "Fire Hacks event icon and favicon.",
  },
];

const DOS = [
  "Use official logo files without altering proportions or colors.",
  "Maintain clear space around logos equal to at least the height of the mark.",
  "Use dark backgrounds (#0A0A0A) for primary brand materials.",
  "Pair CodeStarters with Inter or Instrument Serif; use DM Sans + Space Mono for Fire Hacks.",
  "Credit CodeStarters when referencing programs, events, or sponsorships.",
];

const DONTS = [
  "Do not stretch, rotate, or add effects (shadows, gradients) to logos.",
  "Do not change Fire Hacks red (#EF4444) or place logos on busy backgrounds.",
  "Do not imply endorsement without written approval from CodeStarters leadership.",
  "Do not use outdated marks or combine Fire Hacks branding with unrelated event names.",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
      {children}
    </p>
  );
}

function ColorSwatch({
  name,
  hex,
  usage,
}: {
  name: string;
  hex: string;
  usage: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="h-20 w-full" style={{ backgroundColor: hex }} />
      <div className="p-4">
        <p className="font-semibold text-white">{name}</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{hex}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{usage}</p>
      </div>
    </div>
  );
}

function LogoCard({
  name,
  path,
  format,
  description,
}: {
  name: string;
  path: string;
  format: string;
  description: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-6 flex h-32 items-center justify-center rounded-xl bg-[#0A0A0A]">
        <img src={path} alt={name} className="max-h-20 max-w-[80%] object-contain" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-white">{name}</h3>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {format}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <a
        href={path}
        download
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-300 transition-colors hover:text-sky-200"
      >
        <Download className="h-4 w-4" />
        Download {format}
      </a>
    </div>
  );
}

export const Route = createFileRoute("/branding")({
  head: () => ({
    meta: [
      { title: "Brand Guidelines — CodeStarters" },
      {
        name: "description",
        content:
          "Official CodeStarters and Fire Hacks brand guidelines — logos, colors, typography, and usage rules.",
      },
    ],
  }),
  component: BrandingPage,
});

function BrandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground">
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-20 lg:px-12">
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <motion.div {...fadeUp(0)} className="mb-20">
          <SectionLabel>Brand Guidelines</SectionLabel>
          <div className="flex items-center gap-4">
            <CodeStartersLogo size={48} />
            <div>
              <h1 className="font-serif text-4xl italic lg:text-5xl">CodeStarters</h1>
              <p className="mt-1 text-lg text-muted-foreground">{TAGLINE}</p>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {MISSION}
          </p>
        </motion.div>

        {/* Logos */}
        <motion.section {...fadeUp(0.05)} className="mb-20">
          <SectionLabel>Logo Assets</SectionLabel>
          <h2 className="mb-8 text-2xl font-bold">Downloads</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {LOGO_ASSETS.map((asset) => (
              <LogoCard key={asset.path} {...asset} />
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#0A0A0A]">
                <FireHacksLogo size={40} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Fire Hacks Logo Mark</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Diamond mark in Fire Red (#EF4444). Available as inline SVG in the codebase;
                  use <code className="text-xs text-sky-300">/firehacks-icon.png</code> for raster
                  exports.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Colors */}
        <motion.section {...fadeUp(0.1)} className="mb-20">
          <SectionLabel>Color Palette</SectionLabel>
          <h2 className="mb-2 text-2xl font-bold">CodeStarters</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Dark-first palette with sky-blue accents for programs and highlights.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CODESTARTERS_COLORS.map((color) => (
              <ColorSwatch key={color.hex} {...color} />
            ))}
          </div>

          <h2 className="mb-2 mt-12 text-2xl font-bold">Fire Hacks</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Sub-brand for the Bay Area&apos;s premier high school hackathon.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FIREHACKS_COLORS.map((color) => (
              <ColorSwatch key={color.name} {...color} />
            ))}
          </div>
        </motion.section>

        {/* Typography */}
        <motion.section {...fadeUp(0.15)} className="mb-20">
          <SectionLabel>Typography</SectionLabel>
          <h2 className="mb-8 text-2xl font-bold">Typefaces</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                CodeStarters
              </p>
              <p className="font-serif text-3xl italic">Instrument Serif</p>
              <p className="mt-2 text-sm text-muted-foreground">Display headings, hero copy</p>
              <p className="mt-6 text-xl" style={{ fontFamily: "Inter, sans-serif" }}>
                Inter
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Body text, UI, navigation</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-red-400">Fire Hacks</p>
              <p
                className="text-2xl font-bold tracking-tight text-white"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Space Mono
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Headings, labels, section titles</p>
              <p className="mt-6 text-xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                DM Sans
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Body copy, buttons, descriptions</p>
            </div>
          </div>
        </motion.section>

        {/* Fire Hacks sub-brand */}
        <motion.section {...fadeUp(0.2)} className="mb-20">
          <SectionLabel>Sub-brand</SectionLabel>
          <h2 className="mb-6 text-2xl font-bold">Fire Hacks</h2>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8">
            <div className="flex items-center gap-3">
              <FireHacksLogo size={36} />
              <h3
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                FIRE HACKS
              </h3>
            </div>
            <p className="mt-4 text-muted-foreground">
              Bay Area&apos;s premier high school hackathon, hosted by CodeStarters.
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Date</dt>
                <dd className="mt-1 font-medium text-white">{FIREHACKS_EVENT_DATE_LABEL}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Venue</dt>
                <dd className="mt-1 font-medium text-white">{FIREHACKS_VENUE}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Website</dt>
                <dd className="mt-1">
                  <a
                    href="https://firehacks.codestarters.org"
                    className="font-medium text-red-400 transition-colors hover:text-red-300"
                  >
                    firehacks.codestarters.org
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Relationship
                </dt>
                <dd className="mt-1 font-medium text-white">A CodeStarters event</dd>
              </div>
            </dl>
          </div>
        </motion.section>

        {/* Contact & Legal */}
        <motion.section {...fadeUp(0.25)} className="mb-20">
          <SectionLabel>Contact & Legal</SectionLabel>
          <h2 className="mb-6 text-2xl font-bold">Get in touch</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="mailto:codestarters26@gmail.com"
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">General</p>
              <p className="mt-2 font-medium text-sky-300">codestarters26@gmail.com</p>
            </a>
            <a
              href="mailto:outreach@codestarters.org"
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Sponsorship & Outreach
              </p>
              <p className="mt-2 font-medium text-sky-300">outreach@codestarters.org</p>
            </a>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            CodeStarters is a student-led 501(c)(3) fiscally sponsored nonprofit. EIN:{" "}
            <span className="font-mono text-foreground">81-2908499</span>.
          </p>
        </motion.section>

        {/* Usage guidelines */}
        <motion.section {...fadeUp(0.3)}>
          <SectionLabel>Usage</SectionLabel>
          <h2 className="mb-8 text-2xl font-bold">Do&apos;s & Don&apos;ts</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-emerald-400">
                <Check className="h-4 w-4" />
                Do
              </h3>
              <ul className="space-y-3">
                {DOS.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-red-400">
                <X className="h-4 w-4" />
                Don&apos;t
              </h3>
              <ul className="space-y-3">
                {DONTS.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
