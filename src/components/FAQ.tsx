import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { FIREHACKS_EVENT_DATE_LABEL, FIREHACKS_VENUE } from "@/lib/firehacks/event";

const faqs = [
  [
    "What is Fire Hacks?",
    "Fire Hacks is a one-day in-person hackathon for high school students in the Bay Area. It's organized by CodeStarters and focused entirely on software — web, mobile, and AI/ML. You'll build a project from scratch, attend workshops, eat great food, and compete for $30K+ in prizes.",
  ],
  [
    "When and where is it?",
    `Fire Hacks is on ${FIREHACKS_EVENT_DATE_LABEL} at ${FIREHACKS_VENUE}. It's a full-day, in-person event in the East Bay.`,
  ],
  [
    "Who can attend?",
    "Any current high school student (grades 9–12) can apply. No prior hackathon or coding experience is required — we'll have beginner-friendly workshops and mentors to help you get started.",
  ],
  [
    "How much does it cost?",
    "Nothing. Fire Hacks is 100% free to attend. Meals, snacks, swag, and everything else are fully covered by our sponsors.",
  ],
  [
    "What should I build?",
    "Pick a track that fits your project: AI Track, Developer Tools Track, Research & Innovation Track, or Open Track. Each has dedicated sponsors and prizes — build something that solves a real problem, explores new tech, or is just plain fun.",
  ],
  [
    "How do I become a sponsor?",
    "We'd love to hear from you! Email us at codestarters26@gmail.com, or view our sponsorship prospectus. All sponsorships are tax-deductible through our 501(c)(3) fiscal sponsor.",
  ],
  [
    "Where will sponsor money go?",
    "Every dollar goes directly toward making Fire Hacks happen: venue rental, meals and snacks for all attendees, prizes, swag, workshop materials, and event logistics. We're a nonprofit — there's no profit motive here.",
  ],
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="relative py-32 px-6 bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-red-500 text-sm font-medium tracking-widest uppercase">
            Got Questions?
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            FAQ
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-[#141414] border border-[#1F1F1F] overflow-hidden hover:border-red-500/20 transition-colors"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                >
                  <span className="font-medium text-white pr-4 text-sm sm:text-base">{q}</span>
                  <Plus
                    className={`w-5 h-5 shrink-0 text-red-500 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 text-gray-400 leading-relaxed text-sm">
                        {a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
