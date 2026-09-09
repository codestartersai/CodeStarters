import { motion } from "framer-motion";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const features = [
  {
    title: "Curated Feed",
    description: "Handpicked content that matters, delivered to your inbox.",
  },
  {
    title: "Writer Tools",
    description: "Powerful tools to help you create and distribute content.",
  },
  {
    title: "Community",
    description: "Connect with like-minded thinkers and creators.",
  },
  {
    title: "Distribution",
    description: "Reach your audience through multiple channels.",
  },
];

export function SolutionSection() {
  return (
    <section className="py-32 md:py-44 px-6 border-t border-border/30">
      <motion.p
        {...fadeUp(0)}
        className="text-xs tracking-[3px] uppercase text-muted-foreground text-center mb-6"
      >
        SOLUTION
      </motion.p>

      <motion.h2 {...fadeUp(0.1)} className="text-4xl md:text-6xl text-center mb-16">
        The platform for <span className="font-serif italic">meaningful</span> content
      </motion.h2>

      <motion.div {...fadeUp(0.2)} className="max-w-5xl mx-auto mb-16">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full rounded-2xl aspect-[3/1] object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4"
        />
      </motion.div>

      <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <motion.div key={feature.title} {...fadeUp(0.3 + index * 0.1)} className="text-center">
            <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
            <p className="text-muted-foreground text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
