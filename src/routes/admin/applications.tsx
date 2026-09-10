import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Loader2,
  Search,
  Mail,
  GraduationCap,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Phone,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  Zap,
  Tag,
  Send,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/codestarters/Button";
import { StatusBadge } from "@/components/codestarters/StatusBadge";
import { isExpeditedApplication } from "@/lib/expedited";

type VolunteerApplication = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  interest?: string | null;
  school?: string | null;
  grade_level?: string | null;
  availability?: string | null;
  reason_for_joining?: string | null;
  previous_experience?: string | null;
  social_links?: string | null;
  bio?: string | null;
  resume_path?: string | null;
  resume_url?: string | null;
  created_at: string;
};

type ApplicantEmailTemplate = "interview" | "welcome" | "review" | "custom";

export const Route = createFileRoute("/admin/applications")({
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Email Modal State
  const [replyingTo, setReplyingTo] = useState<VolunteerApplication | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailCtaText, setEmailCtaText] = useState("");
  const [emailCtaUrl, setEmailCtaUrl] = useState("");
  const [autoMarkContacted, setAutoMarkContacted] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ApplicantEmailTemplate>("interview");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const fetchVolunteers = async () => {
    setIsLoading(true);
    setFetchError(null);
    const res = await fetch("/api/admin/volunteers?scope=applications");
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setVolunteers([]);
      setFetchError(typeof data?.error === "string" ? data.error : "Could not load applications.");
    } else {
      setVolunteers(Array.isArray(data) ? (data as VolunteerApplication[]) : []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchVolunteers();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch("/api/admin/volunteers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (!res.ok) return;
    if (newStatus === "completed") {
      setVolunteers(volunteers.filter((v) => v.id !== id));
    } else {
      setVolunteers(volunteers.map((v) => (v.id === id ? { ...v, status: newStatus } : v)));
    }
  };

  const openEmailModal = (vol: VolunteerApplication) => {
    setReplyingTo(vol);
    setSelectedTemplate("interview");
    setEmailSuccess(null);
    setEmailError(null);

    const interest = vol.interest || "CodeStarters";
    setEmailSubject("CodeStarters Application - Next Steps & Interview");
    setEmailMessage(
      `Thank you for applying to join the CodeStarters team! We reviewed your application for ${interest} and were impressed by your enthusiasm and background.\n\nWe'd love to schedule a brief 10–15 minute phone or Zoom chat this week to learn more about you, answer any questions you have, and discuss next steps.\n\nPlease let us know what days and times work best for you this week.`
    );
    setEmailCtaText("Schedule Interview");
    setEmailCtaUrl("");
    setAutoMarkContacted(true);
  };

  const applyTemplate = (template: ApplicantEmailTemplate) => {
    if (!replyingTo) return;
    setSelectedTemplate(template);
    const interest = replyingTo.interest || "CodeStarters";

    switch (template) {
      case "interview":
        setEmailSubject("CodeStarters Application - Next Steps & Interview");
        setEmailMessage(
          `Thank you for applying to join the CodeStarters team! We reviewed your application for ${interest} and were impressed by your enthusiasm and background.\n\nWe'd love to schedule a brief 10–15 minute phone or Zoom chat this week to learn more about you, answer any questions you have, and discuss next steps.\n\nPlease let us know what days and times work best for you this week.`
        );
        setEmailCtaText("Schedule Interview");
        setEmailCtaUrl("");
        break;
      case "welcome":
        setEmailSubject("Welcome to the CodeStarters Team!");
        setEmailMessage(
          `Congratulations! We are delighted to accept your application and welcome you to the CodeStarters team for ${interest}.\n\nYour passion for computer science education and community impact will be a wonderful addition to our upcoming workshops, hackathons, and projects.\n\nWe will follow up shortly with onboarding materials and our next team meeting schedule. Welcome aboard!`
        );
        setEmailCtaText("Join Workspace");
        setEmailCtaUrl("");
        break;
      case "review":
        setEmailSubject("CodeStarters Application - Under Review");
        setEmailMessage(
          `Thank you for applying to CodeStarters for ${interest}! We wanted to confirm that we have received your application and our leadership team is currently reviewing submissions.\n\nWe will be in touch with an update soon. Thank you for your patience and interest in CodeStarters!`
        );
        setEmailCtaText("");
        setEmailCtaUrl("");
        break;
      case "custom":
        setEmailSubject(`CodeStarters Application - ${replyingTo.name}`);
        setEmailMessage("");
        setEmailCtaText("");
        setEmailCtaUrl("");
        break;
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo) return;

    setIsSendingEmail(true);
    setEmailSuccess(null);
    setEmailError(null);

    try {
      const res = await fetch("/api/admin/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          volunteerId: replyingTo.id,
          to: replyingTo.email,
          name: replyingTo.name,
          interest: replyingTo.interest || undefined,
          subject: emailSubject,
          message: emailMessage,
          callToActionText: emailCtaText || undefined,
          callToActionUrl: emailCtaUrl || undefined,
          newStatus: autoMarkContacted ? "contacted" : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to deliver email.");
      }

      setEmailSuccess(data.message || `Email delivered to ${replyingTo.email} via Gmail connector!`);
      if (autoMarkContacted) {
        setVolunteers(volunteers.map((v) => (v.id === replyingTo.id ? { ...v, status: "contacted" } : v)));
      }

      setTimeout(() => {
        setReplyingTo(null);
        setEmailSuccess(null);
      }, 1600);
    } catch (err: unknown) {
      setEmailError(err instanceof Error ? err.message : "Error sending email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const filteredVolunteers = volunteers
    .filter((vol) => {
      const matchesSearch =
        vol.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vol.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || vol.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const expeditedDelta =
        Number(isExpeditedApplication(b.reason_for_joining)) -
        Number(isExpeditedApplication(a.reason_for_joining));
      if (expeditedDelta !== 0) return expeditedDelta;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const pendingCount = volunteers.filter((v) => v.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Applications</h1>
          <p className="text-slate-500 text-xs mt-1">
            {pendingCount > 0 ? (
              <span>
                <span className="text-amber-600 font-semibold">{pendingCount} pending</span>{" "}
                applications need review.
              </span>
            ) : (
              "All caught up. No pending applications."
            )}
          </p>
        </div>
        <Button onClick={fetchVolunteers} variant="secondary" className="h-8 px-3 text-xs bg-white border-slate-200">
          Refresh
        </Button>
      </div>

      {fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800">
          {fetchError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 min-w-[140px]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-3" />
          <p className="text-slate-400 text-xs font-medium">
            Loading applications...
          </p>
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200/80">
          <p className="text-slate-400 text-xs font-medium">No applications found.</p>
        </div>
      ) : (
        <ApplicationsList
          items={filteredVolunteers}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          updateStatus={updateStatus}
          onOpenEmailModal={openEmailModal}
        />
      )}

      {/* Email Applicant Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Email Applicant</h3>
                  <p className="text-xs text-slate-500">
                    Sending via Gmail SMTP to <span className="font-medium text-slate-700">{replyingTo.email}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {emailSuccess && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                {emailSuccess}
              </div>
            )}

            {emailError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                {emailError}
              </div>
            )}

            <form onSubmit={handleSendEmail} className="mt-4 space-y-4">
              {/* Template selection tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quick Template</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyTemplate("interview")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                      selectedTemplate === "interview"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Interview Invitation
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("welcome")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                      selectedTemplate === "welcome"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Acceptance / Welcome
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("review")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                      selectedTemplate === "review"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Under Review
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("custom")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                      selectedTemplate === "custom"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Body (Greeting "Hi {replyingTo.name}," is added automatically)
                </label>
                <textarea
                  required
                  rows={6}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Write message to applicant..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed font-medium outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900 resize-y"
                />
              </div>

              {/* Optional Call to Action Button */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-2.5">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Optional Action Button
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      value={emailCtaText}
                      onChange={(e) => setEmailCtaText(e.target.value)}
                      placeholder="Button text (e.g. Schedule Call)"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium outline-none focus:border-slate-400 text-slate-900"
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      value={emailCtaUrl}
                      onChange={(e) => setEmailCtaUrl(e.target.value)}
                      placeholder="Link URL (https://...)"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium outline-none focus:border-slate-400 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Auto update status */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={autoMarkContacted}
                  onChange={(e) => setAutoMarkContacted(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
                />
                <span className="text-xs text-slate-600 font-medium">
                  Automatically set applicant status to <span className="font-semibold text-purple-700">Contacted</span>
                </span>
              </label>

              {/* Footer buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 text-white rounded-lg font-medium text-xs hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationsList({
  items,
  expandedId,
  setExpandedId,
  updateStatus,
  onOpenEmailModal,
}: {
  items: VolunteerApplication[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  updateStatus: (id: string, status: string) => void | Promise<void>;
  onOpenEmailModal: (applicant: VolunteerApplication) => void;
}) {
  return (
    <div className="grid gap-3.5">
      {items.map((vol) => {
        const isExpanded = expandedId === vol.id;
        return (
          <div
            key={vol.id}
            className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-colors overflow-hidden"
          >
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{vol.name}</h3>
                      {isExpeditedApplication(vol.reason_for_joining) && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                          <Zap className="h-2.5 w-2.5" />
                          Expedited
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" /> {vol.email}
                      </span>
                      {vol.phone && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {vol.phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <StatusBadge status={vol.status} />
              </div>

              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                {vol.interest && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px]">
                    <Tag className="w-3 h-3 text-slate-400" /> {vol.interest}
                  </span>
                )}
                {vol.school && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-medium text-[11px]">
                    <GraduationCap className="w-3 h-3 text-slate-400" /> {vol.school}{" "}
                    {vol.grade_level && `· ${vol.grade_level}`}
                  </span>
                )}
                {vol.availability && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-medium text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" /> {vol.availability}
                  </span>
                )}
                {vol.resume_url && (
                  <a
                    href={vol.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-medium text-[11px] hover:bg-slate-200 transition-colors"
                  >
                    <FileText className="w-3 h-3 text-slate-400" /> Resume
                  </a>
                )}
              </div>

              {vol.reason_for_joining && (
                <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/60 mb-3.5">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Why they want to join
                  </p>
                  <p className="text-slate-700 text-xs leading-relaxed">{vol.reason_for_joining}</p>
                </div>
              )}

              {isExpanded && (
                <div className="space-y-3 mb-4">
                  {vol.previous_experience && (
                    <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/60">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Previous Experience
                      </p>
                      <p className="text-slate-700 text-xs leading-relaxed">
                        {vol.previous_experience}
                      </p>
                    </div>
                  )}
                  {vol.social_links && (
                    <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/60">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Social / Links
                      </p>
                      <p className="text-slate-700 text-xs leading-relaxed break-all">
                        {vol.social_links}
                      </p>
                    </div>
                  )}
                  {vol.resume_url && (
                    <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/60">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Resume
                      </p>
                      <a
                        href={vol.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Open resume
                      </a>
                    </div>
                  )}
                  {vol.bio && (
                    <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/60">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Bio
                      </p>
                      <p className="text-slate-700 text-xs leading-relaxed">{vol.bio}</p>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Applied{" "}
                    {new Date(vol.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-3.5 border-t border-slate-100">
                {/* Email Applicant Button */}
                <button
                  onClick={() => onOpenEmailModal(vol)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg font-medium text-xs hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" /> Email Applicant
                </button>

                {vol.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(vol.id, "completed")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-medium text-xs hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => updateStatus(vol.id, "rejected")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-lg font-medium text-xs hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => updateStatus(vol.id, "contacted")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-purple-600 border border-purple-200 rounded-lg font-medium text-xs hover:bg-purple-50 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Contacted
                    </button>
                  </>
                )}
                {vol.status === "contacted" && (
                  <>
                    <button
                      onClick={() => updateStatus(vol.id, "completed")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-medium text-xs hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => updateStatus(vol.id, "rejected")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-lg font-medium text-xs hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
                {vol.status === "rejected" && (
                  <button
                    onClick={() => updateStatus(vol.id, "pending")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg font-medium text-xs hover:bg-slate-50 transition-colors"
                  >
                    Move back to Pending
                  </button>
                )}

                <button
                  onClick={() => setExpandedId(isExpanded ? null : vol.id)}
                  className="ml-auto flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" /> Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" /> Details
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
