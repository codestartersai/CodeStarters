import { ArrowUpRight } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

const services = [
  {
    number: '01',
    title: 'Brand Identity',
    description:
      'We distill your vision into a living brand system — logo, typography, palette, and voice — that resonates across every touchpoint.',
    tags: ['Strategy', 'Visual Identity', 'Guidelines'],
  },
  {
    number: '02',
    title: 'Digital Experiences',
    description:
      'Immersive web and mobile platforms engineered for performance, built with meticulous craft and obsessive attention to detail.',
    tags: ['Web Design', 'Development', 'Interaction'],
  },
  {
    number: '03',
    title: 'Content Direction',
    description:
      'From editorial strategy to art direction, we shape narratives that move audiences and elevate your presence.',
    tags: ['Art Direction', 'Copywriting', 'Photography'],
  },
  {
    number: '04',
    title: 'Growth Systems',
    description:
      'Data-informed marketing architectures that compound over time — SEO, analytics, and conversion frameworks built to scale.',
    tags: ['SEO', 'Analytics', 'Automation'],
  },
]

export default function ServicesSection() {
  const ref = useReveal<HTMLElement>()

  return (
    <section
      ref={ref}
      id="studio"
      className="bg-background py-32 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="reveal">
          <span className="inline-block rounded-full border border-foreground/15 px-4 py-1.5 text-xs uppercase tracking-widest text-muted">
            Services
          </span>
        </div>

        <div className="mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <h2
            className="reveal reveal-stagger-1 font-display text-4xl sm:text-5xl md:text-6xl text-foreground max-w-3xl"
            style={{ lineHeight: 1.05 }}
          >
            Crafting digital experiences with{' '}
            <em className="text-muted">purpose</em>
          </h2>
          <p className="reveal reveal-stagger-2 text-muted max-w-md text-base">
            A focused practice of designers, engineers, and strategists shaping
            tools and stories for the brands of tomorrow.
          </p>
        </div>

        <div className="mt-20 divide-y divide-foreground/10 border-t border-foreground/10">
          {services.map((service, i) => (
            <div
              key={service.number}
              className={`reveal reveal-stagger-${i + 1} group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 py-10 items-start md:items-center`}
            >
              <div className="md:col-span-1 text-sm text-muted">
                {service.number}
              </div>
              <div className="md:col-span-3">
                <h3 className="font-display text-3xl md:text-4xl text-foreground">
                  {service.title}
                </h3>
              </div>
              <div className="md:col-span-5">
                <p className="text-base text-muted leading-relaxed">
                  {service.description}
                </p>
              </div>
              <div className="md:col-span-3 flex flex-wrap items-center gap-2 md:justify-end">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-foreground/5 rounded-full px-3 py-1 text-xs text-muted"
                  >
                    {tag}
                  </span>
                ))}
                <button
                  type="button"
                  aria-label={`Learn more about ${service.title}`}
                  className="ml-2 h-10 w-10 rounded-full border border-foreground/10 flex items-center justify-center text-foreground transition-colors group-hover:bg-foreground group-hover:text-white group-hover:border-foreground"
                >
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
