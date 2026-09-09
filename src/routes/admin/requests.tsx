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
    Calendar,
    Building2,
    Check,
    Trash2,
    FileEdit,
    ExternalLink,
    Send,
    X,
    Link as LinkIcon,
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
    notes?: string | null;
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
    const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
    const [notesDraft, setNotesDraft] = useState("");

    // Email Reply Modal State
    const [replyingToRequest, setReplyingToRequest] = useState<WebsiteRequestRow | null>(null);
    const [replySubject, setReplySubject] = useState("");
    const [replyMessage, setReplyMessage] = useState("");
    const [replyCtaText, setReplyCtaText] = useState("");
    const [replyCtaUrl, setReplyCtaUrl] = useState("");
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [replySuccessMessage, setReplySuccessMessage] = useState<string | null>(null);
    const [replyErrorMessage, setReplyErrorMessage] = useState<string | null>(null);

    const fetchRequests = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const res = await fetch("/api/admin/website-requests");
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(typeof data?.error === "string" ? data.error : "Could not load requests.");
            }
            setRequests(Array.isArray(data) ? (data as WebsiteRequestRow[]) : []);
        } catch (err: unknown) {
            setFetchError(err instanceof Error ? err.message : "Error fetching requests.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchRequests();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch("/api/admin/website-requests", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to update status.");
            setRequests(requests.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Error updating status.");
        }
    };

    const saveNotes = async (id: string) => {
        try {
            const res = await fetch("/api/admin/website-requests", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, notes: notesDraft }),
            });
            if (!res.ok) throw new Error("Failed to save note.");
            setRequests(requests.map((r) => (r.id === id ? { ...r, notes: notesDraft } : r)));
            setEditingNotesId(null);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Error saving note.");
        }
    };

    const deleteRequest = async (id: string, name: string) => {
        if (!confirm(`Delete website request from "${name}"?`)) return;
        try {
            const res = await fetch(`/api/admin/website-requests?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete request.");
            setRequests(requests.filter((r) => r.id !== id));
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Error deleting request.");
        }
    };

    // Open Reply Modal with smart pre-filled values
    const openReplyModal = (req: WebsiteRequestRow) => {
        setReplyingToRequest(req);
        setReplySubject(`Re: CodeStarters Website Request - ${req.business_name}`);
        setReplyCtaText("");
        setReplyCtaUrl("");
        setReplySuccessMessage(null);
        setReplyErrorMessage(null);

        // Default to a warm consultation kickoff message
        setReplyMessage(
            `Thank you for reaching out to CodeStarters! We are a student-led initiative teaching CS and building custom websites at no cost for local Cupertino businesses.\n\n` +
            `We reviewed your inquiry for ${req.business_name} and would love to learn more about your vision. Are you available for a brief 15-minute phone or Zoom call this week to go over the project and answer any questions you might have?`
        );
    };

    const applyReplyTemplate = (templateType: "kickoff" | "details" | "in_progress" | "waitlist") => {
        if (!replyingToRequest) return;
        const biz = replyingToRequest.business_name;
        const owner = replyingToRequest.owner_name;

        switch (templateType) {
            case "kickoff":
                setReplySubject(`Re: CodeStarters Website Request - ${biz}`);
                setReplyMessage(
                    `Thank you for reaching out to CodeStarters! We are a student-led initiative teaching CS and building custom websites at no cost for local Cupertino businesses.\n\n` +
                    `We reviewed your inquiry for ${biz} and would love to learn more about your vision. Are you available for a brief 15-minute phone or Zoom call this week to go over the project and answer any questions you might have?`
                );
                setReplyCtaText("Schedule 15-Min Call");
                setReplyCtaUrl("");
                break;
            case "details":
                setReplySubject(`CodeStarters: Gathering Details for ${biz} Website`);
                setReplyMessage(
                    `Thanks for your patience as we prepare the design phase for ${biz}!\n\n` +
                    `To help our student developers create the best possible first draft, could you please reply with:\n` +
                    `1. Any existing logos, brand colors, or photos you'd like featured\n` +
                    `2. Essential pages and content (e.g. Menu, Services list, Hours, Contact phone/address)\n` +
                    `3. 1 or 2 websites whose design or feel you admire\n\n` +
                    `Once we have these details, we'll begin assembling the prototype right away!`
                );
                setReplyCtaText("");
                setReplyCtaUrl("");
                break;
            case "in_progress":
                setReplySubject(`Update on your ${biz} Website Development - CodeStarters`);
                setReplyMessage(
                    `We're excited to let you know that our development team has officially started building your website for ${biz}!\n\n` +
                    `Our student leads are coding the initial layout and structure. We will send you an interactive preview link within the next few days so you can see the progress and provide your feedback.`
                );
                setReplyCtaText("");
                setReplyCtaUrl("");
                break;
            case "waitlist":
                setReplySubject(`CodeStarters Website Request - ${biz}`);
                setReplyMessage(
                    `Thank you for taking the time to submit a request for ${biz}. Our current cohort of student developers is currently at maximum capacity for this active project cycle.\n\n` +
                    `We have placed your business on our priority waitlist. As soon as our upcoming development sprint begins, we will reach out immediately to get your website underway.`
                );
                setReplyCtaText("");
                setReplyCtaUrl("");
                break;
        }
    };

    const handleSendEmailReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyingToRequest) return;
        setIsSendingReply(true);
        setReplySuccessMessage(null);
        setReplyErrorMessage(null);

        try {
            const res = await fetch("/api/admin/website-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "reply",
                    requestId: replyingToRequest.id,
                    to: replyingToRequest.email,
                    recipientName: replyingToRequest.owner_name,
                    businessName: replyingToRequest.business_name,
                    subject: replySubject,
                    message: replyMessage,
                    callToActionText: replyCtaText || undefined,
                    callToActionUrl: replyCtaUrl || undefined,
                    updateStatus: true,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok) {
                throw new Error(data.error || "Failed to send email reply.");
            }

            setReplySuccessMessage(data.message || "Email delivered successfully via Gmail connector!");
            // Update local state to contacted
            setRequests(requests.map((r) => (r.id === replyingToRequest.id ? { ...r, status: "contacted" } : r)));

            setTimeout(() => {
                setReplyingToRequest(null);
                setReplySuccessMessage(null);
            }, 1800);
        } catch (err: unknown) {
            setReplyErrorMessage(err instanceof Error ? err.message : "Error sending email.");
        } finally {
            setIsSendingReply(false);
        }
    };

    const filteredRequests = requests.filter((req) => {
        const matchesSearch =
            req.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.business_type?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = requests.filter((r) => r.status === "pending").length;
    const inProgressCount = requests.filter((r) => r.status === "in_progress").length;
    const completedCount = requests.filter((r) => r.status === "completed").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                            Website Requests
                        </h1>
                        <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                            {requests.length} total
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">
                        Inquiries from local Cupertino businesses looking for custom websites.
                    </p>
                </div>
                <Button onClick={fetchRequests} variant="secondary" size="sm">
                    Refresh Pipeline
                </Button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                    <p className="text-[11px] font-medium text-slate-500">Total Submissions</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{requests.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                    <p className="text-[11px] font-medium text-amber-600">Needs Review</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{pendingCount}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                    <p className="text-[11px] font-medium text-blue-600">In Development</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{inProgressCount}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                    <p className="text-[11px] font-medium text-emerald-600">Launched</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{completedCount}</p>
                </div>
            </div>

            {fetchError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
                    {fetchError}
                </div>
            )}

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by business, owner, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-400 text-xs font-normal text-slate-900 placeholder:text-slate-400 transition-colors"
                    />
                </div>
                <div className="relative min-w-[160px]">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-400 text-xs font-medium text-slate-700 cursor-pointer"
                    >
                        <option value="all">All Status ({requests.length})</option>
                        <option value="pending">Pending ({pendingCount})</option>
                        <option value="in_progress">In Progress ({inProgressCount})</option>
                        <option value="contacted">Contacted</option>
                        <option value="completed">Completed ({completedCount})</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* List Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200/80">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin mb-2" />
                    <p className="text-xs text-slate-400">Loading requests...</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200/80 p-6">
                    <p className="text-slate-400 text-xs">No website requests found matching your filters.</p>
                </div>
            ) : (
                <div className="grid gap-3.5">
                    {filteredRequests.map((req) => {
                        const isExpanded = expandedId === req.id;
                        const isEditingNotes = editingNotesId === req.id;

                        return (
                            <div
                                key={req.id}
                                className="bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors overflow-hidden"
                            >
                                <div className="p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-semibold text-slate-900">{req.business_name}</h3>
                                                {req.cupertino_consent && (
                                                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium border border-emerald-200">
                                                        Cupertino Verified
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Contact: <strong className="font-medium text-slate-700">{req.owner_name}</strong> {req.business_type && `· ${req.business_type}`}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <StatusBadge status={req.status} />
                                            <button
                                                onClick={() => deleteRequest(req.id, req.business_name)}
                                                className="p-1 text-slate-300 hover:text-red-600 rounded transition-colors"
                                                title="Delete request"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contact Chips */}
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => openReplyModal(req)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors"
                                        >
                                            <Mail className="w-3 h-3 text-slate-500" />
                                            <span>{req.email}</span>
                                        </button>

                                        {req.phone && (
                                            <a
                                                href={`tel:${req.phone}`}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md text-xs font-medium border border-slate-200/60 transition-colors"
                                            >
                                                <Phone className="w-3 h-3 text-slate-400" />
                                                <span>{req.phone}</span>
                                            </a>
                                        )}

                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-400 text-xs font-mono">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                        </span>
                                    </div>

                                    {/* Business description */}
                                    {req.description && (
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mb-3 text-xs text-slate-700 leading-relaxed">
                                            {req.description}
                                        </div>
                                    )}

                                    {/* Expanded features & notes */}
                                    {isExpanded && (
                                        <div className="space-y-3 mb-3">
                                            {req.needs && (
                                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                                                        Requested Features
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {req.needs.split(",").map((n) => (
                                                            <span
                                                                key={n}
                                                                className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-xs"
                                                            >
                                                                {n.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Internal notes & communication history */}
                                            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <p className="text-[10px] font-medium text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                                        <FileEdit className="w-3 h-3" /> Notes & Email Audit Log
                                                    </p>
                                                    {!isEditingNotes && (
                                                        <button
                                                            onClick={() => {
                                                                setNotesDraft(req.notes || "");
                                                                setEditingNotesId(req.id);
                                                            }}
                                                            className="text-xs font-medium text-amber-700 hover:underline"
                                                        >
                                                            {req.notes ? "Edit Note" : "+ Add Note"}
                                                        </button>
                                                    )}
                                                </div>

                                                {isEditingNotes ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            rows={3}
                                                            value={notesDraft}
                                                            onChange={(e) => setNotesDraft(e.target.value)}
                                                            className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs text-slate-900 outline-none"
                                                            placeholder="Add internal notes about this client..."
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => saveNotes(req.id)}
                                                                className="px-2.5 py-1 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700"
                                                            >
                                                                Save Note
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingNotesId(null)}
                                                                className="px-2.5 py-1 text-slate-600 rounded text-xs font-medium hover:bg-slate-100"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                                                        {req.notes || "No notes logged yet."}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Bar */}
                                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => openReplyModal(req)}
                                        >
                                            <Send className="w-3 h-3" />
                                            <span>Reply via Email</span>
                                        </Button>

                                        {req.status === "pending" ? (
                                            <>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => updateStatus(req.id, "in_progress")}
                                                >
                                                    <PlayCircle className="w-3.5 h-3.5" /> Start Build
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => updateStatus(req.id, "rejected")}
                                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                                >
                                                    Decline
                                                </Button>
                                            </>
                                        ) : req.status === "in_progress" ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateStatus(req.id, "completed")}
                                                    className="bg-emerald-600 hover:bg-emerald-700"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                                                </Button>
                                                <select
                                                    value={req.status}
                                                    onChange={(e) => updateStatus(req.id, e.target.value)}
                                                    className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg outline-none"
                                                >
                                                    <option value="pending">Move to Pending</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </>
                                        ) : (
                                            <select
                                                value={req.status}
                                                onChange={(e) => updateStatus(req.id, e.target.value)}
                                                className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg outline-none"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="completed">Completed</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        )}

                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : req.id)}
                                            className="ml-auto flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <ChevronUp className="w-3 h-3" /> Less
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-3 h-3" /> Details
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Email Reply Modal */}
            {replyingToRequest && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-xl bg-white rounded-xl shadow-xl p-6 border border-slate-200 my-8">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Reply to {replyingToRequest.business_name}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Sending to <strong className="font-medium text-slate-700">{replyingToRequest.email}</strong> via Gmail
                                </p>
                            </div>
                            <button
                                onClick={() => setReplyingToRequest(null)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Templates Bar */}
                        <div className="mb-4">
                            <label className="text-[11px] font-medium text-slate-500 block mb-1.5">
                                Quick Templates
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => applyReplyTemplate("kickoff")}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors"
                                >
                                    Kickoff Call
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyReplyTemplate("details")}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors"
                                >
                                    Request Details
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyReplyTemplate("in_progress")}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors"
                                >
                                    Build Started
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyReplyTemplate("waitlist")}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors"
                                >
                                    Waitlist
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSendEmailReply} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-medium text-slate-700 block mb-1">
                                    Subject *
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={replySubject}
                                    onChange={(e) => setReplySubject(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-slate-400 text-slate-900"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-700 block mb-1">
                                    Message *
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs outline-none focus:border-slate-400 text-slate-900 leading-relaxed font-sans"
                                    placeholder="Write your email response..."
                                />
                            </div>

                            {/* Optional CTA button */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                                <div>
                                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                                        Button Text (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={replyCtaText}
                                        onChange={(e) => setReplyCtaText(e.target.value)}
                                        placeholder="e.g. Schedule 15-Min Call"
                                        className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-slate-400 text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                                        Button Link URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={replyCtaUrl}
                                        onChange={(e) => setReplyCtaUrl(e.target.value)}
                                        placeholder="https://calendly.com/..."
                                        className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-slate-400 text-slate-900"
                                    />
                                </div>
                            </div>

                            {replySuccessMessage && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-xs font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{replySuccessMessage}</span>
                                </div>
                            )}

                            {replyErrorMessage && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800 text-xs font-medium">
                                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                                    <span>{replyErrorMessage}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <span className="text-[11px] text-slate-400">
                                    Auto-marks status as <strong>Contacted</strong>
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setReplyingToRequest(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={isSendingReply}
                                    >
                                        {isSendingReply ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-3 h-3" />
                                                <span>Send Email</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
