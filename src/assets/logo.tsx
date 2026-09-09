export function FireHacksLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 2L28 16L16 30L4 16L16 2Z" fill="#EF4444" opacity="0.9" />
      <path d="M16 8L22 16L16 24L10 16L16 8Z" fill="#0A0A0A" />
    </svg>
  );
}

export function CodeStartersLogo({ size = 32, white = false }: { size?: number; white?: boolean }) {
  return (
    <img
      src="/cs-logo.png"
      alt="CodeStarters"
      width={size}
      height={size}
      className={`rounded-sm ${white ? "brightness-0 invert" : ""}`}
    />
  );
}

export function FullFireHacksLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <FireHacksLogo size={28} />
      <div className="leading-none">
        <div className="font-display text-lg font-bold tracking-tight text-foreground">
          Fire Hacks
        </div>
      </div>
    </div>
  );
}

export function FullCodeStartersLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <CodeStartersLogo size={28} />
      <div className="leading-none">
        <div className="font-display text-lg font-semibold tracking-tight text-cs-foreground">
          CodeStarters
        </div>
      </div>
    </div>
  );
}
