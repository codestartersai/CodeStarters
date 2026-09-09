import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Loader2,
  Search,
  Mail,
  GraduationCap,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  XCircle,
  Phone,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  Zap,
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Applications</h1>
          <p className="text-slate-500">
            {pendingCount > 0 ? (
              <span>
                <span className="text-amber-600 font-bold">{pendingCount} pending</span>{" "}
                applications need review.
              </span>
            ) : (
              "All caught up. No pending applications."
            )}
          </p>
        </div>
        <Button onClick={fetchVolunteers} variant="secondary" className="bg-white border-slate-200">
          Refresh
        </Button>
      </div>

      {fetchError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {fetchError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-slate-700 appearance-none min-w-[160px]"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            Loading applications...
          </p>
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
          <p className="text-slate-400 font-medium">No applications found.</p>
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
    <div className="grid gap-5">
      {items.map((vol) => {
        const isExpanded = expandedId === vol.id;
        return (
          <div
            key={vol.id}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                    <User className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900">{vol.name}</h3>
                      {isExpeditedApplication(vol.reason_for_joining) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                          <Zap className="h-3 w-3" />
                          Expedited
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {vol.email}
                      </span>
                      {vol.phone && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> {vol.phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <StatusBadge status={vol.status} />
              </div>

              <div className="flex flex-wrap gap-3 mb-5 text-sm">
                {vol.interest && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-xl font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> {vol.interest}
                  </span>
                )}
                {vol.school && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl font-bold">
                    <GraduationCap className="w-3.5 h-3.5" /> {vol.school}{" "}
                    {vol.grade_level && `· ${vol.grade_level}`}
                  </span>
                )}
                {vol.availability && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl font-bold">
                    <Clock className="w-3.5 h-3.5" /> {vol.availability}
                  </span>
                )}
                {vol.resume_url && (
                  <a
                    href={vol.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100"
                  >
                    <FileText className="w-3.5 h-3.5" /> Resume
                  </a>
                )}
              </div>

              {vol.reason_for_joining && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Why they want to join
                  </p>
                  <p className="text-slate-700 text-sm leading-relaxed">{vol.reason_for_joining}</p>
                </div>
              )}

              {isExpanded && (
                <div className="space-y-4 mb-5">
                  {vol.previous_experience && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Previous Experience
                      </p>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {vol.previous_experience}
                      </p>
                    </div>
                  )}
                  {vol.social_links && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Social / Links
                      </p>
                      <p className="text-slate-700 text-sm leading-relaxed break-all">
                        {vol.social_links}
                      </p>
                    </div>
                  )}
                  {vol.resume_url && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Resume
                      </p>
                      <a
                        href={vol.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800"
                      >
                        <FileText className="w-4 h-4" />
                        Open resume
                      </a>
                    </div>
                  )}
                  {vol.bio && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Bio
                      </p>
                      <p className="text-slate-700 text-sm leading-relaxed">{vol.bio}</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-400">
                    Applied{" "}
                    {new Date(vol.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                {vol.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(vol.id, "completed")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => updateStatus(vol.id, "rejected")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => updateStatus(vol.id, "contacted")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-600 border border-purple-200 rounded-xl font-bold text-sm hover:bg-purple-50 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" /> Contacted
                    </button>
                  </>
                )}
                {vol.status === "contacted" && (
                  <>
                    <button
                      onClick={() => updateStatus(vol.id, "completed")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => updateStatus(vol.id, "rejected")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                {vol.status === "rejected" && (
                  <button
                    onClick={() => updateStatus(vol.id, "pending")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Move back to Pending
                  </button>
                )}

                <button
                  onClick={() => setExpandedId(isExpanded ? null : vol.id)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" /> Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" /> More
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
