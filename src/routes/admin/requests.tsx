import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/codestarters/StatusBadge";
import {
  Loader2,
  Search,
  Filter,
  Mail,
  Phone,
  Globe,
  CheckCircle2,
  XCircle,
  PlayCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/codestarters/Button";

type WebsiteRequestRow = {
  id: string;
  business_name: string;
  owner_name: string;
  business_type?: string | null;
  email: string;
  phone?: string | null;
  description?: string | null;
  needs?: string | null;
  cupertino_consent?: boolean | null;
  status: string;
  created_at: string;
};

export const Route = createFileRoute("/admin/requests")({
  component: WebsiteRequestsPage,
});

function WebsiteRequestsPage() {
  const [requests, setRequests] = useState<WebsiteRequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    setFetchError(null);
    const res = await fetch("/api/admin/website-requests");
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setRequests([]);
      setFetchError(typeof data?.error === "string" ? data.error : "Could not load requests.");
    } else {
      setRequests(Array.isArray(data) ? (data as WebsiteRequestRow[]) : []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch("/api/admin/website-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (!res.ok) return;
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Website Requests</h1>
          <p className="text-slate-500">
            {pendingCount > 0 ? (
              <span>
                <span className="text-amber-600 font-bold">{pendingCount} pending</span> requests
                from businesses.
              </span>
            ) : (
              "All caught up. No pending requests."
            )}
          </p>
        </div>
        <Button onClick={fetchRequests} variant="secondary" className="bg-white border-slate-200">
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
            placeholder="Search by business, owner, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
          />
        </div>
        <div className="relative min-w-[160px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-slate-700 appearance-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            Loading requests...
          </p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
          <p className="text-slate-400 font-medium">No requests found.</p>
        </div>
      ) : (
        <RequestsList
          items={filteredRequests}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          updateStatus={updateStatus}
        />
      )}
    </div>
  );
}

function RequestsList({
  items,
  expandedId,
  setExpandedId,
  updateStatus,
}: {
  items: WebsiteRequestRow[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  updateStatus: (id: string, status: string) => void | Promise<void>;
}) {
  return (
    <div className="grid gap-5">
      {items.map((req) => {
        const isExpanded = expandedId === req.id;
        return (
          <div
            key={req.id}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{req.business_name}</h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {req.owner_name} · {req.business_type}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold">
                  <Mail className="w-3.5 h-3.5" /> {req.email}
                </span>
                {req.phone && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold">
                    <Phone className="w-3.5 h-3.5" /> {req.phone}
                  </span>
                )}
                {req.business_type && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-xl text-sm font-bold">
                    <Globe className="w-3.5 h-3.5" /> {req.business_type}
                  </span>
                )}
              </div>

              {req.description && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    What they need
                  </p>
                  <p className="text-slate-700 text-sm leading-relaxed">{req.description}</p>
                </div>
              )}

              {isExpanded && (
                <div className="space-y-4 mb-5">
                  {req.needs && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Specific Features
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {req.needs.split(",").map((need: string) => (
                          <span
                            key={need}
                            className="px-3 py-1 bg-white text-slate-700 rounded-lg text-xs font-bold border border-slate-200"
                          >
                            {need.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-slate-400">
                    Submitted{" "}
                    {new Date(req.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                {req.status === "pending" ? (
                  <>
                    <button
                      onClick={() => updateStatus(req.id, "in_progress")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" /> Accept & Start
                    </button>
                    <button
                      onClick={() => updateStatus(req.id, "rejected")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                    <button
                      onClick={() => updateStatus(req.id, "contacted")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-600 border border-purple-200 rounded-xl font-bold text-sm hover:bg-purple-50 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" /> Contacted
                    </button>
                  </>
                ) : req.status === "in_progress" ? (
                  <>
                    <button
                      onClick={() => updateStatus(req.id, "completed")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Complete
                    </button>
                    <select
                      className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
                      value={req.status}
                      onChange={(e) => updateStatus(req.id, e.target.value)}
                    >
                      <option value="pending">Set Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="contacted">Set Contacted</option>
                      <option value="completed">Set Completed</option>
                      <option value="rejected">Set Rejected</option>
                    </select>
                  </>
                ) : (
                  <select
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
                    value={req.status}
                    onChange={(e) => updateStatus(req.id, e.target.value)}
                  >
                    <option value="pending">Set Pending</option>
                    <option value="in_progress">Set In Progress</option>
                    <option value="contacted">Set Contacted</option>
                    <option value="completed">Set Completed</option>
                    <option value="rejected">Set Rejected</option>
                  </select>
                )}

                <button
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
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
