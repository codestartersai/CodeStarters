import { EVENTS, type CodeStartersEvent } from "@/lib/events";
import { cn } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Check } from "lucide-react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

const THEMES = {
  firehacks: {
    card: "border-red-500/40 bg-red-500/[0.06] hover:border-red-500/55 hover:bg-red-500/[0.1]",
    icon: "border-red-500/35 bg-red-500/10 text-red-400",
    badge: "rounded-full border-red-500/40 bg-red-500/15 text-red-400",
    bannerBadge: "rounded-full border-red-500/45 bg-red-950/70 text-red-300",
    check: "text-red-400",
    bannerEdge: "border-red-500/25",
  },
  rlc: {
    card: "border-fuchsia-400/30 bg-[linear-gradient(135deg,rgba(232,121,249,0.14)_0%,rgba(139,92,246,0.1)_48%,rgba(56,189,248,0.16)_100%)] shadow-[0_0_40px_-10px_rgba(168,85,247,0.55)] hover:border-sky-400/40 hover:shadow-[0_0_48px_-8px_rgba(56,189,248,0.45)]",
    icon: "border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-200",
    badge:
      "rounded-md border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500/25 via-violet-500/20 to-sky-400/25 text-fuchsia-100",
    bannerBadge:
      "rounded-md border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500/35 via-violet-500/30 to-sky-400/35 text-fuchsia-50",
    check: "text-sky-300",
    bannerEdge: "border-fuchsia-400/20",
  },
} as const;

function themeOf(event: CodeStartersEvent) {
  return event.theme ? THEMES[event.theme] : null;
}

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events | CodeStarters" },
      {
        name: "description",
        content:
          "CodeStarters events, including 2026 Python Bootcamp, 2026 Fire Hacks, and RLC Hacks.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 lg:px-12">
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <motion.div {...fadeUp(0)} className="mb-16 text-center">
          <p className="mb-4 text-xs uppercase tracking-[3px] text-muted-foreground">Events</p>
          <h1 className="mb-4 text-4xl md:text-6xl">
            What we&apos;ve <span className="font-serif italic">hosted</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Classes and events from CodeStarters.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {EVENTS.map((event, index) => {
            const theme = themeOf(event);

            return (
              <motion.article
                key={event.slug}
                {...fadeUp(0.08 + index * 0.06)}
                className={cn(
                  "flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors duration-300",
                  theme?.card,
                )}
              >
                {event.banner ? (
                  <div
                    className={cn(
                      "relative border-b border-white/10 bg-black",
                      theme?.bannerEdge,
                    )}
                  >
                    <img
                      src={event.banner}
                      alt={`${event.name} banner`}
                      className="h-auto w-full object-cover"
                    />
                    <span
                      className={cn(
                        "absolute right-3 top-3 border border-white/15 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm",
                        theme?.bannerBadge,
                      )}
                    >
                      Completed
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3 px-6 pt-6 md:px-8 md:pt-8">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70",
                        theme?.icon,
                      )}
                    >
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60",
                        theme?.badge,
                      )}
                    >
                      Completed
                    </span>
                  </div>
                )}
                <div className="flex flex-1 flex-col px-6 pb-6 pt-5 md:px-8 md:pb-8">
                  <h2 className="mb-3 text-2xl font-semibold text-white">{event.name}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{event.desc}</p>
                  <ul className="mt-5 space-y-2 text-sm text-white/75">
                    {event.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2">
                        <Check
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 text-sky-200",
                            theme?.check,
                          )}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto pt-6 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
                    {event.eligibility} · {event.length} · {event.when}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
