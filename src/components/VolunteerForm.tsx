import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, Clock, Loader2, MapPin, Upload } from "lucide-react";
import { HIGH_SCHOOL_GRADES } from "@/lib/expedited";
import { OPEN_ROLE_GROUPS, getOpenRole } from "@/lib/open-roles";

interface VolunteerFormProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRole?: string;
  /** Role group category (e.g. "Leadership") — filters the interest dropdown. */
  preselectedGroup?: string;
}

const ROLE_GROUPS = OPEN_ROLE_GROUPS.map((group) => ({
  label: group.category,
  roles: group.roles.map((role) => role.name),
}));

const inputCls =
  "w-full bg-input border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all text-white placeholder:text-muted-foreground text-sm";

export function VolunteerForm({
  isOpen,
  onClose,
  preselectedRole,
  preselectedGroup,
}: VolunteerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState("");
  const visibleGroups = preselectedGroup
    ? ROLE_GROUPS.filter((group) => group.label === preselectedGroup)
    : ROLE_GROUPS;
  const groupRoles = visibleGroups.flatMap((group) => group.roles);
  const [selectedRole, setSelectedRole] = useState(preselectedRole ?? "");
  const roleDetails = getOpenRole(selectedRole);

  useEffect(() => {
    if (!isOpen) return;
    if (preselectedRole) {
      setSelectedRole(preselectedRole);
      return;
    }
    const roles = (preselectedGroup
      ? ROLE_GROUPS.filter((group) => group.label === preselectedGroup)
      : ROLE_GROUPS
    ).flatMap((group) => group.roles);
    setSelectedRole(roles.length === 1 ? roles[0] : "");
  }, [isOpen, preselectedRole, preselectedGroup]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        body: new FormData(e.currentTarget),
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
            className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 transition-colors z-20"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex-1 overflow-y-auto p-5 sm:p-8 md:p-10">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Application received!</h3>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    We'll review your application and reach out via email shortly.
                  </p>
                  <button
                    onClick={onClose}
                    className="rounded-full bg-foreground px-8 py-3 font-medium text-background"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8 border-b border-white/10 pb-8">
                    <p className="mb-3 text-xs uppercase tracking-[3px] text-muted-foreground">
                      Open roles
                    </p>
                    <h3 className="mb-2 text-3xl font-bold text-white">
                      {preselectedGroup
                        ? `${preselectedGroup} volunteer application`
                        : "Volunteer application"}
                    </h3>
                    <p className="text-muted-foreground">
                      {preselectedGroup
                        ? `You're applying for a ${preselectedGroup} role. Pick the position that fits you best.`
                        : "Apply for a leadership, teaching, marketing, or fundraising role below."}
                    </p>
                    <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
                      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">
                        <MapPin className="h-3.5 w-3.5" />
                        High school · Bay Area required
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-amber-50/85">
                        We only hire current high school students (grades 9–12) who live in the
                        San Francisco Bay Area. Remote and college applicants will not be
                        considered.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label htmlFor="v-name" className="text-sm font-medium text-white/80">
                          Full Name *
                        </label>
                        <input
                          required
                          name="name"
                          id="v-name"
                          type="text"
                          className={inputCls}
                          placeholder="Alex Chen"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="v-email" className="text-sm font-medium text-white/80">
                          Email *
                        </label>
                        <input
                          required
                          name="email"
                          id="v-email"
                          type="email"
                          className={inputCls}
                          placeholder="alex@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label htmlFor="v-phone" className="text-sm font-medium text-white/80">
                          Phone
                        </label>
                        <input
                          name="phone"
                          id="v-phone"
                          type="tel"
                          className={inputCls}
                          placeholder="(555) 000-0000"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="v-school" className="text-sm font-medium text-white/80">
                          School *
                        </label>
                        <input
                          required
                          name="school"
                          id="v-school"
                          type="text"
                          className={inputCls}
                          placeholder="Cupertino High School"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label htmlFor="v-grade" className="text-sm font-medium text-white/80">
                          Grade *
                        </label>
                        <select required name="grade" id="v-grade" className={inputCls}>
                          <option value="">Select</option>
                          {HIGH_SCHOOL_GRADES.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="v-interest" className="text-sm font-medium text-white/80">
                          Area of Interest *
                        </label>
                        <select
                          required
                          name="interest"
                          id="v-interest"
                          key={`${preselectedGroup ?? ""}:${preselectedRole ?? ""}`}
                          value={selectedRole}
                          onChange={(event) => setSelectedRole(event.target.value)}
                          className={inputCls}
                        >
                          {groupRoles.length !== 1 && <option value="">Select a role</option>}
                          {visibleGroups.map((group) => (
                            <optgroup key={group.label} label={group.label}>
                              {group.roles.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>

                    {roleDetails && (
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-[0.16em] text-white/70">
                          <p className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {roleDetails.hours}
                          </p>
                          <p className="inline-flex items-center gap-1.5 text-amber-100">
                            <MapPin className="h-3.5 w-3.5" />
                            Bay Area · in person
                          </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                              Expect
                            </p>
                            <ul className="space-y-1.5 text-sm text-muted-foreground">
                              {roleDetails.expectations.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                              You get
                            </p>
                            <ul className="space-y-1.5 text-sm text-muted-foreground">
                              {roleDetails.returns.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label htmlFor="v-avail" className="text-sm font-medium text-white/80">
                        Availability *
                      </label>
                      <textarea
                        required
                        name="availability"
                        id="v-avail"
                        rows={2}
                        className={inputCls}
                        placeholder="2–5 hours/week, weekends, etc."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="v-links" className="text-sm font-medium text-white/80">
                        Portfolio / GitHub / LinkedIn
                      </label>
                      <input
                        name="socialLinks"
                        id="v-links"
                        type="text"
                        className={inputCls}
                        placeholder="Links to your work"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="v-reason" className="text-sm font-medium text-white/80">
                        Why join CodeStarters? *
                      </label>
                      <textarea
                        required
                        name="reason"
                        id="v-reason"
                        rows={3}
                        className={inputCls}
                        placeholder="Your motivation and goals..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="v-resume" className="text-sm font-medium text-white/80">
                        Resume
                      </label>
                      <label
                        htmlFor="v-resume"
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-input px-4 py-3 text-sm transition-all hover:border-white/30"
                      >
                        <span className={resumeName ? "truncate text-white" : "text-muted-foreground"}>
                          {resumeName || "PDF, DOC, or DOCX · optional"}
                        </span>
                        <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </label>
                      <input
                        name="resume"
                        id="v-resume"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="sr-only"
                        onChange={(event) => setResumeName(event.target.files?.[0]?.name ?? "")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="v-exp" className="text-sm font-medium text-white/80">
                        Previous Experience
                      </label>
                      <textarea
                        name="experience"
                        id="v-exp"
                        rows={2}
                        className={inputCls}
                        placeholder="Any relevant experience..."
                      />
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3">
                      <input
                        required
                        name="bayArea"
                        type="checkbox"
                        value="yes"
                        className="mt-1 h-4 w-4 shrink-0 rounded border-amber-300/60 bg-transparent accent-amber-300"
                      />
                      <span className="text-sm leading-relaxed text-white/85">
                        I live in the San Francisco Bay Area and can take this role in person. *
                      </span>
                    </label>

                    {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-full bg-foreground px-8 py-3.5 font-medium text-background disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
