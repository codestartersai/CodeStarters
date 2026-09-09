const navItems = [
  { label: 'Home', active: true },
  { label: 'Studio', active: false },
  { label: 'About', active: false },
  { label: 'Journal', active: false },
  { label: 'Reach Us', active: false },
]

export default function Navbar() {
  return (
    <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-6">
      <a href="#" className="font-display text-3xl text-foreground leading-none">
        Aethera<sup className="text-xs align-super">®</sup>
      </a>

      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`text-sm transition-colors hover:text-foreground ${
              item.active ? 'text-foreground' : 'text-muted'
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>

      <a
        href="#"
        className="rounded-full bg-foreground text-white px-6 py-2.5 text-sm transition-transform hover:scale-[1.03]"
      >
        Begin Journey
      </a>
    </nav>
  )
}
