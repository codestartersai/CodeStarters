import { motion } from "framer-motion";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const platforms = [
  {
    name: "ChatGPT",
    icon: "/assets/icon-chatgpt.png",
    description: "AI-powered conversations for instant answers and creative assistance.",
  },
  {
    name: "Perplexity",
    icon: "/assets/icon-perplexity.png",
    description: "Real-time answers with cited sources and deep research capabilities.",
  },
  {
    name: "Google AI",
    icon: "/assets/icon-google.png",
    description: "Integrated AI across Google's ecosystem for seamless information access.",
  },
];

export function SearchSection() {
  return (
    <section className="pt-52 md:pt-64 pb-6 md:pb-9 px-6">
      <motion.h2 {...fadeUp(0)} className="text-5xl md:text-7xl lg:text-8xl text-center mb-6">
        Search has <span className="font-serif italic">changed.</span> Have you?
      </motion.h2>

      <motion.p
        {...fadeUp(0.1)}
        className="text-muted-foreground text-lg max-w-2xl mx-auto mb-24 text-center"
      >
        The way we discover information has fundamentally shifted. Stay ahead of the curve with
        curated insights.
      </motion.p>

      <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-20 max-w-5xl mx-auto">
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.name}
            {...fadeUp(0.2 + index * 0.1)}
            className="flex flex-col items-center text-center"
          >
            <div className="w-[200px] h-[200px] mb-6 flex items-center justify-center">
              <img
                src={platform.icon}
                alt={platform.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <h3 className="font-semibold text-base mb-2">{platform.name}</h3>
            <p className="text-muted-foreground text-sm">{platform.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.p {...fadeUp(0.5)} className="text-muted-foreground text-sm text-center">
        If you don't answer the questions, someone else will.
      </motion.p>
    </section>
  );
}
