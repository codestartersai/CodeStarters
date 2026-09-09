export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-8 md:px-28 flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-muted-foreground text-sm">
        © 2026 CodeStarters. Fire Hacks is a CodeStarters event.
      </p>
      <div className="flex items-center gap-6">
        <a
          href="https://codestarters.org"
          className="text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          CodeStarters
        </a>
        <a
          href="https://discord.gg/utUNdDz3"
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          Discord
        </a>
        <a
          href="/branding"
          className="text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          Brand
        </a>
        <a
          href="mailto:codestarters26@gmail.com"
          className="text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          Contact
        </a>
      </div>
    </footer>
  );
}
