import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const paragraph1 =
  "We're building a space where curiosity meets clarity — where readers find depth, writers find reach, and every newsletter becomes a conversation worth having.";
const paragraph2 =
  "A platform where content, community, and insight flow together — with less noise, less friction, and more meaning for everyone involved.";

const highlightWords1 = ["curiosity", "meets", "clarity"];

export function MissionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const words1 = paragraph1.split(" ");
  const words2 = paragraph2.split(" ");

  const opacity1 = useTransform(scrollYProgress, [0, 1], [0.15, 1]);
  const opacity2 = useTransform(scrollYProgress, [0.2, 1], [0.15, 1]);

  return (
    <section ref={containerRef} className="pt-0 pb-32 md:pb-44 px-6">
      <motion.div {...fadeUp(0)} className="flex justify-center mb-16">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-[800px] h-[800px] object-cover rounded-2xl"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4"
        />
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <p className="text-2xl md:text-4xl lg:text-5xl font-medium tracking-[-1px] leading-relaxed">
          {words1.map((word, index) => {
            const cleanWord = word.replace(/[.,]/g, "");
            const isHighlighted = highlightWords1.includes(cleanWord);

            return (
              <motion.span
                key={`word1-${index}`}
                style={{ opacity: opacity1 }}
                className={`inline-block mr-2 ${isHighlighted ? "" : "text-hero-subtitle"}`}
              >
                {word}
              </motion.span>
            );
          })}
        </p>

        <p className="text-xl md:text-2xl lg:text-3xl font-medium mt-10 text-muted-foreground">
          {words2.map((word, index) => (
            <motion.span
              key={`word2-${index}`}
              style={{ opacity: opacity2 }}
              className="inline-block mr-2"
            >
              {word}
            </motion.span>
          ))}
        </p>
      </div>
    </section>
  );
}
