import { CodeStartersLogo } from "@/assets/logo";
import { EXPEDITED_REASON, HIGH_SCHOOL_GRADES } from "@/lib/expedited";
import { OPEN_ROLE_GROUPS } from "@/lib/open-roles";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, GraduationCap, Loader2, MapPin, Zap } from "lucide-react";
import { FormEvent, useState } from "react";

const AVAILABILITY = ["2–3 hrs/week", "4–6 hrs/week", "Weekends", "Flexible"];

const inputCls =
  "w-full bg-input border border-border rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all text-white placeholder:text-muted-foreground text-base";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join CodeStarters | Expedited application" },
      {
        name: "description",
        content: "Club fair expedited signup for CodeStarters. Takes about 30 seconds.",
      },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interest, setInterest] = useState("");
  const [availability, setAvailability] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to submit. Please try again.");
      }
      setIsSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8 flex items-center gap-3">
          <CodeStartersLogo size={28} white />
          <span className="font-bold">CodeStarters</span>
        </div>

        {isSubmitted ? (
          <div className="rounded-3xl border border-emerald-400/25 bg-emerald-400/10 px-6 py-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15">
              <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            </div>
            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              <Zap className="h-3.5 w-3.5" />
              Expedited
            </p>
            <h1 className="text-3xl font-bold">You&apos;re on the list</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-emerald-50/80">
              We marked your application as expedited from club fair. We&apos;ll email you soon.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                <Zap className="h-3.5 w-3.5" />
                Club fair · Expedited
              </p>
              <h1 className="text-4xl font-bold tracking-tight">Join the team</h1>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Short form. About 30 seconds. You&apos;ll be marked expedited so we review you first.
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-amber-100">
                <GraduationCap className="h-4 w-4" />
                High school only · grades 9–12
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="hidden" name="expedited" value="yes" />
              <input type="hidden" name="reason" value={EXPEDITED_REASON} />
              <input type="hidden" name="interest" value={interest} />
              <input type="hidden" name="availability" value={availability} />

              <div className="space-y-1.5">
                <label htmlFor="join-name" className="text-sm font-medium text-white/80">
                  Full name *
                </label>
                <input
                  required
                  autoComplete="name"
                  name="name"
                  id="join-name"
                  type="text"
                  className={inputCls}
                  placeholder="Alex Chen"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="join-email" className="text-sm font-medium text-white/80">
                  Email *
                </label>
                <input
                  required
                  autoComplete="email"
                  name="email"
                  id="join-email"
                  type="email"
                  inputMode="email"
                  className={inputCls}
                  placeholder="alex@example.com"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="join-school" className="text-sm font-medium text-white/80">
                    School *
                  </label>
                  <input
                    required
                    name="school"
                    id="join-school"
                    type="text"
                    className={inputCls}
                    placeholder="School"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="join-grade" className="text-sm font-medium text-white/80">
                    Grade *
                  </label>
                  <select required name="grade" id="join-grade" className={inputCls}>
                    <option value="">Select</option>
                    {HIGH_SCHOOL_GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="join-phone" className="text-sm font-medium text-white/80">
                  Phone
                </label>
                <input
                  autoComplete="tel"
                  name="phone"
                  id="join-phone"
                  type="tel"
                  inputMode="tel"
                  className={inputCls}
                  placeholder="(555) 000-0000"
                />
              </div>

              <fieldset className="space-y-2.5">
                <legend className="text-sm font-medium text-white/80">Role you want *</legend>
                <div className="space-y-4">
                  {OPEN_ROLE_GROUPS.map((group) => (
                    <div key={group.category}>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                        {group.category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.roles.map((role) => {
                          const selected = interest === role.name;
                          return (
                            <button
                              key={role.name}
                              type="button"
                              onClick={() => setInterest(role.name)}
                              className={`rounded-full border px-3 py-2 text-left text-sm transition-colors ${
                                selected
                                  ? "border-white/40 bg-white text-black"
                                  : "border-white/15 bg-white/5 text-white hover:border-white/30"
                              }`}
                            >
                              {role.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>

              <fieldset className="space-y-2.5">
                <legend className="text-sm font-medium text-white/80">Availability *</legend>
                <div className="flex flex-wrap gap-2">
                  {AVAILABILITY.map((option) => {
                    const selected = availability === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAvailability(option)}
                        className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                          selected
                            ? "border-white/40 bg-white text-black"
                            : "border-white/15 bg-white/5 text-white hover:border-white/30"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3">
                <input
                  required
                  name="bayArea"
                  type="checkbox"
                  value="yes"
                  className="mt-1 h-4 w-4 shrink-0 rounded border-amber-300/60 bg-transparent accent-amber-300"
                />
                <span className="text-sm leading-relaxed text-white/85">
                  I live in the Bay Area and can do this in person. *
                </span>
              </label>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                <p className="inline-flex items-center gap-1.5 text-amber-100">
                  <MapPin className="h-3.5 w-3.5" />
                  Bay Area · in person
                </p>
              </div>

              {error && <p className="text-sm font-medium text-red-400">{error}</p>}
              {!interest && (
                <p className="text-sm text-white/45">Pick a role before you submit.</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !interest || !availability}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-base font-medium text-background disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit expedited application"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
