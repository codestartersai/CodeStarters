import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { SUMMER_BOOTCAMPS } from "@/lib/summer-bootcamps";

interface SummerSignupFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultBootcamp?: string;
  embedded?: boolean;
}

const GRADES = [
  "Kindergarten",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
  "Other / above 12th",
];

const inputCls =
  "w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-muted-foreground focus:border-white/30 focus:ring-2 focus:ring-white/20";

export function SummerSignupForm({
  isOpen = true,
  onClose,
  defaultBootcamp = "",
  embedded = false,
}: SummerSignupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/summer-signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          school: formData.get("school"),
          grade: formData.get("grade"),
          bootcamp: formData.get("bootcamp"),
          notes: formData.get("notes"),
        }),
      });
      const response = await res.json().catch(() => null);
      if (!res.ok) throw new Error(response?.error || "Failed to submit signup. Please try again.");
      setIsSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit signup. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formBody = (
    <div className={embedded ? "" : "flex-1 overflow-y-auto p-5 sm:p-8 md:p-10"}>
      {isSubmitted ? (
        <div className={embedded ? "py-10 text-center" : "py-12 text-center"}>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-white">Signup received — email sent!</h3>
          <p className="mx-auto mb-8 max-w-sm text-muted-foreground">
            We sent your confirmation email with a QR code for entry. Check your inbox, and if you
            don&apos;t see it, check spam or promotions.
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full bg-foreground px-8 py-3 font-medium text-background"
            >
              Close
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-8">
            <p className="mb-3 text-xs uppercase tracking-[3px] text-muted-foreground">Summer 2026</p>
            <h3 className="mb-2 text-3xl font-bold text-white">Summer bootcamp signup</h3>
            <p className="text-muted-foreground">
              Choose a 1-week class. Our featured AI track takes students from zero to building real
              agents. Dates are TBD.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <input required name="name" className={inputCls} placeholder="Student full name *" />
              <input
                required
                name="email"
                type="email"
                className={inputCls}
                placeholder="Parent/student email *"
              />
              <input name="phone" type="tel" className={inputCls} placeholder="Phone" />
              <input required name="school" className={inputCls} placeholder="School *" />
              <select required name="grade" className={inputCls} defaultValue="">
                <option value="">Select grade *</option>
                {GRADES.map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
              </select>
              <select
                required
                name="bootcamp"
                className={inputCls}
                defaultValue={defaultBootcamp}
                key={defaultBootcamp}
              >
                <option value="">Select bootcamp *</option>
                {SUMMER_BOOTCAMPS.map((bootcamp) => (
                  <option key={bootcamp.name} value={bootcamp.name}>
                    {bootcamp.label ?? bootcamp.name} — {bootcamp.eligibility}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground sm:grid-cols-2">
              {SUMMER_BOOTCAMPS.map((bootcamp) => (
                <div
                  key={bootcamp.name}
                  className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-3 py-2"
                >
                  <div>
                    <span className="font-medium text-white/80">
                      {bootcamp.label ?? bootcamp.name}
                    </span>
                    {bootcamp.badge && (
                      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-200">
                        {bootcamp.badge}
                      </div>
                    )}
                  </div>
                  <span>{bootcamp.eligibility}</span>
                </div>
              ))}
            </div>
            <textarea
              name="notes"
              rows={3}
              className={inputCls}
              placeholder="Anything we should know? Prior experience, schedule constraints, etc."
            />
            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input required type="checkbox" className="mt-1 h-4 w-4 accent-white" />I understand
              these are 1-week bootcamps and dates are still TBD.
            </label>
            {error && <p className="text-sm font-medium text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 py-3.5 font-medium text-background disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Submit Summer Signup"
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );

  if (embedded) {
    return formBody;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {onClose && (
              <button
                onClick={onClose}
                className="absolute right-5 top-5 z-20 rounded-full p-2 transition-colors hover:bg-white/10"
                aria-label="Close signup form"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            {formBody}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
