export default function HeroSection() {
  return (
    <section
      className="relative z-10 flex flex-col items-center text-center px-6 pb-40"
      style={{ paddingTop: 'calc(8rem - 75px)' }}
    >
      <h1
        className="font-display text-5xl sm:text-7xl md:text-8xl text-foreground max-w-7xl animate-fade-rise"
        style={{ lineHeight: 0.95, letterSpacing: '-2.46px' }}
      >
        <em className="text-muted">Beyond</em> silence, we{' '}
        <em className="text-muted">build</em> the eternal.
      </h1>

      <p className="mt-8 text-base sm:text-lg text-muted max-w-2xl animate-fade-rise-delay">
        Building platforms for brilliant minds, fearless makers, and thoughtful
        souls. Through the noise, we craft digital havens for deep work and
        pure flows.
      </p>

      <a
        href="#"
        className="mt-10 inline-block rounded-full bg-foreground text-white px-14 py-5 text-base transition-transform hover:scale-[1.03] animate-fade-rise-delay-2"
      >
        Begin Journey
      </a>
    </section>
  )
}
