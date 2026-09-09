import { ExternalLink, Instagram } from "lucide-react";
import { useLocation } from "@tanstack/react-router";
import { CodeStartersLogo } from "@/assets/logo";

const fireHacksLinks = [
  ["About", "#about"],
  ["Tracks", "#tracks"],
  ["Sponsors", "#sponsors"],
  ["Prospectus", "/firehacks-sponsorship-prospectus.pdf"],
  ["FAQ", "#faq"],
];

export function Navbar() {
  const location = useLocation();
  const isFireHacks = location.pathname.startsWith("/firehacks");

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/[0.06] bg-[#0A0A0A]/80 px-6 py-3 backdrop-blur-xl md:px-10">
      <a href={isFireHacks ? "/firehacks" : "/"} className="flex items-center gap-3">
        <CodeStartersLogo size={28} white />
        <span className="font-bold text-base text-white">
          {isFireHacks ? "Fire Hacks" : "CodeStarters"}
        </span>
      </a>

      <div className="hidden md:flex items-center gap-1 text-sm">
        {fireHacksLinks.map(([link, href], index) => (
          <div key={link} className="flex items-center">
            <a
              href={href}
              className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              {link}
            </a>
            {index < fireHacksLinks.length - 1 && (
              <span className="text-muted-foreground/40">•</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://www.instagram.com/cupertino_codestarters/"
          target="_blank"
          rel="noreferrer"
          className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Instagram"
        >
          <Instagram className="w-4 h-4" />
        </a>
        <a
          href="https://discord.gg/utUNdDz3"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-white/35 hover:text-white"
        >
          Discord <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <a
          href="https://luma.com/event/evt-teYwe8vJ6Eqne8d"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Register
        </a>
      </div>
    </nav>
  );
}
