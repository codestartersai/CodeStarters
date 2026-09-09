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
        />
      )}
    </div>
  );
}

function ApplicationsList({
  items,
  expandedId,
  setExpandedId,
  updateStatus,
}: {
  items: VolunteerApplication[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  updateStatus: (id: string, status: string) => void | Promise<void>;
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
