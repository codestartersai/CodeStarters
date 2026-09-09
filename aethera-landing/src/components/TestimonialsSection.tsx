import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

const TESTIMONIAL_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4'

const testimonials = [
  {
    name: 'Carolyn Chapman',
    role: 'People & Culture Operations Manager',
    company: 'Meridian Group',
    quote:
      'Working with Aethera felt less like a vendor relationship and more like collaborative problem-solving. They listened, challenged our assumptions, and shipped something we are genuinely proud to put our name on.',
  },
  {
    name: 'Marcus Reid',
    role: 'Chief Product Officer',
    company: 'Coastal Living Co.',
    quote:
      'They transformed our digital presence from a scattered collection of touchpoints into a single, coherent voice. The lift in engagement after launch wasn’t a fluke — it was the natural result of clearer thinking.',
  },
  {
    name: 'Lena Okafor',
    role: 'Brand Director',
    company: 'Solaris Ventures',
    quote:
      'Aethera operates as a true extension of our team. They show up with rigor, they push when it matters, and they leave us with systems we can actually run with long after the project ends.',
  },
]

const logos = ['Meridian', 'GFS', 'Solaris', 'Coastal', 'Vertex']

export default function TestimonialsSection() {
  const ref = useReveal<HTMLElement>()
  const [active, setActive] = useState(0)
  const total = testimonials.length

  const prev = () => setActive((i) => (i - 1 + total) % total)
  const next = () => setActive((i) => (i + 1) % total)

  const t = testimonials[active]

  return (
    <section ref={ref} className="bg-background py-32 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="reveal">
          <span className="inline-block rounded-full border border-foreground/15 px-4 py-1.5 text-xs uppercase tracking-widest text-muted">
            Testimonials
          </span>
        </div>

        <h2
          className="reveal reveal-stagger-1 mt-8 font-display text-4xl sm:text-5xl text-foreground max-w-lg"
          style={{ lineHeight: 1.05 }}
        >
          Trusted by growing companies
        </h2>

        <div className="reveal reveal-stagger-2 mt-10 flex items-center gap-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                i === active
                  ? 'border-foreground bg-foreground'
                  : 'border-foreground/20 bg-transparent hover:border-foreground/40'
              }`}
            />
          ))}
        </div>

        <div className="reveal reveal-stagger-3 mt-14 w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-left">
            <div className="md:col-span-2 rounded-2xl overflow-hidden">
              <video
                src={TESTIMONIAL_VIDEO}
                muted
                loop
                playsInline
                autoPlay
                className="h-72 md:h-full w-full object-cover"
              />
            </div>
            <div className="md:col-span-3 flex flex-col justify-between">
              <blockquote className="text-lg md:text-xl leading-relaxed text-foreground">
                {t.quote}
              </blockquote>
              <div className="border-t border-foreground/10 pt-6 mt-8 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {t.name}
                  </div>
                  <div className="text-sm text-muted">
                    {t.role}, {t.company}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous testimonial"
                    className="group h-10 w-10 rounded-full border border-foreground/10 flex items-center justify-center text-foreground transition-colors hover:bg-foreground hover:text-white hover:border-foreground"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next testimonial"
                    className="group h-10 w-10 rounded-full border border-foreground/10 flex items-center justify-center text-foreground transition-colors hover:bg-foreground hover:text-white hover:border-foreground"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="reveal reveal-stagger-4 w-full max-w-5xl border-t border-foreground/10 pt-12 mt-20">
          <div className="flex flex-wrap items-center justify-between gap-y-6 gap-x-10">
            {logos.map((logo) => (
              <span
                key={logo}
                className="font-display text-xl text-foreground/20"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
