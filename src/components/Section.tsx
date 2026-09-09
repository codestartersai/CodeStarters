import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="relative py-24 sm:py-32 px-6 bg-[#0a0505]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {eyebrow && (
            <div className="text-sm uppercase tracking-[0.2em] text-red-500 font-medium mb-3">
              {eyebrow}
            </div>
          )}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-100">
            {title}
          </h2>
          {subtitle && <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">{subtitle}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  );
}
