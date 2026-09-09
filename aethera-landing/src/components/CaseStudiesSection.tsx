import { ArrowUpRight } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

const projects = [
  {
    name: 'Meridian Health',
    category: 'Brand & Web Platform',
    stat: '553K+',
    label: 'Monthly active users across digital channels',
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260407_043131_ebe2f0b5-9acc-4a4f-b2c1-7297f1a3beb9.mp4',
  },
  {
    name: 'Coastal Living',
    category: 'E-Commerce Redesign',
    stat: '96%',
    label: 'Improvement in conversion rate after launch',
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4',
  },
]

export default function CaseStudiesSection() {
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} className="bg-foreground py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <div className="reveal">
              <span className="inline-block rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-widest text-white/50">
                Selected Work
              </span>
            </div>
            <h2
              className="reveal reveal-stagger-1 mt-6 font-display text-4xl sm:text-5xl md:text-6xl text-white max-w-3xl"
              style={{ lineHeight: 1.05 }}
            >
              See how we&apos;ve <em className="text-white/60">shaped</em>{' '}
              others
            </h2>
          </div>
          <a
            href="#"
            className="reveal reveal-stagger-2 text-white/50 uppercase tracking-widest text-sm hover:text-white transition-colors"
          >
            View All
          </a>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <div
              key={project.name}
              className={`reveal reveal-stagger-${i + 1} group relative rounded-2xl overflow-hidden`}
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <video
                  src={project.video}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-white/60">
                      {project.category}
                    </div>
                    <div
                      className="mt-3 font-display text-5xl md:text-6xl text-white"
                      style={{ lineHeight: 1 }}
                    >
                      {project.stat}
                    </div>
                    <div className="mt-3 text-sm text-white/60 max-w-xs">
                      {project.label}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`View ${project.name} case study`}
                    className="shrink-0 h-12 w-12 rounded-full bg-white text-foreground flex items-center justify-center transition-transform group-hover:scale-105"
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
