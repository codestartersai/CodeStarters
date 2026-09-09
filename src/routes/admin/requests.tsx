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
    Sparkles,
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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Website Requests
                        <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                            {requests.length} Submissions
                        </span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Inquiries from local Cupertino businesses looking for custom websites. Reply directly via the Gmail connector.
                    </p>
                </div>
                <Button onClick={fetchRequests} variant="secondary" className="bg-white border-slate-200 text-xs font-bold h-11">
                    Refresh Pipeline
                </Button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Received</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{requests.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Needs Review</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">In Development</p>
                    <p className="text-2xl font-black text-blue-600 mt-1">{inProgressCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Launched</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</p>
                </div>
            </div>

            {fetchError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                    {fetchError}
                </div>
            )}

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by business, owner, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium shadow-sm"
                    />
                </div>
                <div className="relative min-w-[170px]">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-slate-700 shadow-sm cursor-pointer"
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
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading requests...</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8">
                    <p className="text-slate-400 font-medium text-sm">No website requests found matching your filters.</p>
                </div>
            ) : (
                <div className="grid gap-5">
                    {filteredRequests.map((req) => {
                        const isExpanded = expandedId === req.id;
                        const isEditingNotes = editingNotesId === req.id;

                        return (
                            <div
                                key={req.id}
                                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden"
                            >
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2.5">
                                                <h3 className="text-xl font-black text-slate-900">{req.business_name}</h3>
                                                {req.cupertino_consent && (
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200">
                                                        Cupertino Verified
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium mt-0.5">
                                                Owner: <strong>{req.owner_name}</strong> {req.business_type && `· ${req.business_type}`}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <StatusBadge status={req.status} />
                                            <button
                                                onClick={() => deleteRequest(req.id, req.business_name)}
                                                className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete request"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contact Chips */}
                                    <div className="flex flex-wrap items-center gap-2.5 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => openReplyModal(req)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-100 transition-colors"
                                        >
                                            <Mail className="w-3.5 h-3.5 text-blue-600" />
                                            <span>{req.email}</span>
                                        </button>

                                        {req.phone && (
                                            <a
                                                href={`tel:${req.phone}`}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-100 transition-colors"
                                            >
                                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                                <span>{req.phone}</span>
                                            </a>
                                        )}

                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-xs font-medium">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                        </span>
                                    </div>

                                    {/* Business description */}
                                    {req.description && (
                                        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 mb-4">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                Project Description
                                            </p>
                                            <p className="text-slate-700 text-sm leading-relaxed">{req.description}</p>
                                        </div>
                                    )}

                                    {/* Expanded features & notes */}
                                    {isExpanded && (
                                        <div className="space-y-4 mb-4">
                                            {req.needs && (
                                                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                                        Requested Features
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {req.needs.split(",").map((n) => (
                                                            <span
                                                                key={n}
                                                                className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-xs"
                                                            >
                                                                {n.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Internal notes & communication history */}
                                            <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/60">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-[11px] font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                                                        <FileEdit className="w-3.5 h-3.5" /> Notes & Email Audit Log
                                                    </p>
                                                    {!isEditingNotes && (
                                                        <button
                                                            onClick={() => {
                                                                setNotesDraft(req.notes || "");
                                                                setEditingNotesId(req.id);
                                                            }}
                                                            className="text-xs font-bold text-amber-700 hover:underline"
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
                                                            className="w-full bg-white border border-amber-300 rounded-xl p-3 text-xs text-slate-900 outline-none"
                                                            placeholder="Add internal notes about this client..."
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => saveNotes(req.id)}
                                                                className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700"
                                                            >
                                                                Save Note
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingNotesId(null)}
                                                                className="px-3 py-1 text-slate-500 rounded-lg text-xs font-medium hover:bg-slate-100"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                                                        {req.notes || "No notes or email replies logged yet."}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Bar */}
                                    <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-slate-100">
                                        {/* Quick Reply via Connector Button */}
                                        <button
                                            type="button"
                                            onClick={() => openReplyModal(req)}
                                            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-brand-100"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            <span>Reply via Email Connector</span>
                                        </button>

                                        {req.status === "pending" ? (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(req.id, "in_progress")}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-colors"
                                                >
                                                    <PlayCircle className="w-4 h-4" /> Start Build
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(req.id, "rejected")}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-white text-red-600 border border-red-200 rounded-xl font-bold text-xs hover:bg-red-50 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" /> Decline
                                                </button>
                                            </>
                                        ) : req.status === "in_progress" ? (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(req.id, "completed")}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> Mark Completed
                                                </button>
                                                <select
                                                    value={req.status}
                                                    onChange={(e) => updateStatus(req.id, e.target.value)}
                                                    className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl outline-none"
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
                                                className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl outline-none"
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
                                            className="ml-auto flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider transition-colors"
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
            )}

            {/* Email Reply Modal */}
            {replyingToRequest && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 my-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <Send className="w-5 h-5 text-brand-600" />
                                    Reply to {replyingToRequest.business_name}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Delivered via Gmail SMTP connector to <strong>{replyingToRequest.email}</strong> ({replyingToRequest.owner_name})
                                </p>
                            </div>
                            <button
                                onClick={() => setReplyingToRequest(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Quick Response Templates Bar */}
                        <div className="mb-5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Response Templates
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => applyReplyTemplate("kickoff")}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                                    <span>Kickoff Call</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyReplyTemplate("details")}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                                >
                                    Request Assets & Details
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyReplyTemplate("in_progress")}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                                >
                                    Development Started
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyReplyTemplate("waitlist")}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                                >
                                    Waitlist
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSendEmailReply} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Subject Line *
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={replySubject}
                                    onChange={(e) => setReplySubject(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Email Message *
                                </label>
                                <textarea
                                    required
                                    rows={7}
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 leading-relaxed"
                                    placeholder="Write your response message..."
                                />
                            </div>

                            {/* Optional Call to Action */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                        Button Text (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={replyCtaText}
                                        onChange={(e) => setReplyCtaText(e.target.value)}
                                        placeholder="e.g. Schedule 15-Min Call"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                        Button Link URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={replyCtaUrl}
                                        onChange={(e) => setReplyCtaUrl(e.target.value)}
                                        placeholder="https://calendly.com/... or https://..."
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    />
                                </div>
                            </div>

                            {replySuccessMessage && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{replySuccessMessage}</span>
                                </div>
                            )}

                            {replyErrorMessage && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-800 text-xs font-bold">
                                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                                    <span>{replyErrorMessage}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <span className="text-[11px] text-slate-400 font-medium">
                                    Status will update to <strong>Contacted</strong> automatically.
                                </span>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setReplyingToRequest(null)}
                                        className="h-11 px-5 text-xs font-bold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSendingReply}
                                        className="h-11 px-6 text-xs font-bold bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-100 flex items-center gap-2"
                                    >
                                        {isSendingReply ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Send Email Reply</span>
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
