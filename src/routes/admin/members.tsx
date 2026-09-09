import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
    UserPlus,
    Shield,
    Mail,
    CheckCircle2,
    Clock,
    Copy,
    Trash2,
    Edit2,
    Check,
    AlertCircle,
    Loader2,
    Send,
    Key,
    UserCheck,
    X,
} from "lucide-react";
import { Button } from "@/components/codestarters/Button";
import {
    AVAILABLE_PERMISSIONS,
    ROLE_DEFAULT_PERMISSIONS,
    type AdminRole,
    type AdminPermission,
    type AdminUser,
    type AdminInvite,
} from "@/lib/admin-auth";
import { useAdminSession } from "@/routes/admin/route";

export const Route = createFileRoute("/admin/members")({
    component: AdminMembersPage,
});

function AdminMembersPage() {
    const { admin: currentUser } = useAdminSession();
    const [members, setMembers] = useState<AdminUser[]>([]);
    const [invites, setInvites] = useState<AdminInvite[]>([]);
    const [emailConfigured, setEmailConfigured] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Invite Modal
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState<AdminRole>("editor");
    const [selectedPerms, setSelectedPerms] = useState<AdminPermission[]>(ROLE_DEFAULT_PERMISSIONS.editor);
    const [isSendingInvite, setIsSendingInvite] = useState(false);
    const [lastInviteResult, setLastInviteResult] = useState<{
        message: string;
        inviteUrl?: string;
        emailSent: boolean;
    } | null>(null);

    // Edit Permissions Modal
    const [editingMember, setEditingMember] = useState<AdminUser | null>(null);
    const [editRole, setEditRole] = useState<AdminRole>("editor");
    const [editPerms, setEditPerms] = useState<AdminPermission[]>([]);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    const fetchMembers = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const res = await fetch("/api/admin/members");
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to load admin members.");

            setMembers(data.members || []);
            setInvites(data.invites || []);
            setEmailConfigured(Boolean(data.emailConfigured));
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : "Error fetching members.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchMembers();
    }, []);

    const handleRoleChange = (role: AdminRole) => {
        setSelectedRole(role);
        setSelectedPerms(ROLE_DEFAULT_PERMISSIONS[role] || ["manage_team"]);
    };

    const togglePermission = (perm: AdminPermission) => {
        if (selectedPerms.includes(perm)) {
            setSelectedPerms(selectedPerms.filter((p) => p !== perm));
        } else {
            setSelectedPerms([...selectedPerms, perm]);
        }
    };

    const toggleEditPermission = (perm: AdminPermission) => {
        if (editPerms.includes(perm)) {
            setEditPerms(editPerms.filter((p) => p !== perm));
        } else {
            setEditPerms([...editPerms, perm]);
        }
    };

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSendingInvite(true);
        setLastInviteResult(null);

        try {
            const res = await fetch("/api/admin/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: inviteEmail,
                    role: selectedRole,
                    permissions: selectedRole === "super_admin" ? ["all"] : selectedPerms,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to send invitation.");

            setLastInviteResult({
                message: data.message,
                inviteUrl: data.inviteUrl,
                emailSent: data.emailSent,
            });

            setInviteEmail("");
            await fetchMembers();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Error sending invitation.");
        } finally {
            setIsSendingInvite(false);
        }
    };

    const handleSavePermissions = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;
        setIsSavingEdit(true);

        try {
            const res = await fetch("/api/admin/members", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingMember.id,
                    role: editRole,
                    permissions: editRole === "super_admin" ? ["all"] : editPerms,
                }),
            });

            if (!res.ok) throw new Error("Failed to update permissions.");
            setEditingMember(null);
            await fetchMembers();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Error updating permissions.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleRevokeMember = async (id: string, name: string) => {
        if (!confirm(`Revoke admin access for ${name}? They will no longer be able to access the dashboard.`)) return;
        try {
            const res = await fetch(`/api/admin/members?memberId=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to revoke access.");
            setMembers(members.filter((m) => m.id !== id));
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Error revoking member.");
        }
    };

    const handleCancelInvite = async (id: string, email: string) => {
        if (!confirm(`Cancel pending invitation for ${email}?`)) return;
        try {
            const res = await fetch(`/api/admin/members?inviteId=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to cancel invitation.");
            setInvites(invites.filter((i) => i.id !== id));
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Error canceling invite.");
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedToken(id);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                            Access Control & Invites
                        </h1>
                        <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                            {members.length} administrators
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">
                        Invite administrators with single-use setup links and customize permissions.
                    </p>
                </div>

                <Button
                    onClick={() => {
                        setLastInviteResult(null);
                        setIsInviteModalOpen(true);
                    }}
                    size="sm"
                >
                    <UserPlus className="w-3.5 h-3.5" />
                    Invite Administrator
                </Button>
            </div>

            {/* Email Connector status banner */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                emailConfigured ? "bg-emerald-50/50 border-emerald-200 text-emerald-950" : "bg-amber-50/50 border-amber-200 text-amber-950"
            }`}>
                <div className="flex items-center gap-2.5">
                    <Mail className={`w-4 h-4 shrink-0 ${emailConfigured ? "text-emerald-600" : "text-amber-600"}`} />
                    <div>
                        <p className="text-xs font-semibold">
                            {emailConfigured ? "Gmail SMTP Connector Active" : "Gmail Connector Not Configured"}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                            {emailConfigured
                                ? "Invitations are sent automatically to recipient email addresses."
                                : "Set GMAIL_USER and GMAIL_APP_PASSWORD in your environment to deliver invites automatically. You can also copy links manually."}
                        </p>
                    </div>
                </div>

                <a
                    href="/admin/settings"
                    className="text-xs font-medium px-2.5 py-1 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 whitespace-nowrap transition-colors"
                >
                    Email Settings &rarr;
                </a>
            </div>

            {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
                    {errorMessage}
                </div>
            )}

            {/* Active Administrators Section */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                <div className="pb-3 mb-3 border-b border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-900">Active Administrators</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Users with verified access to the dashboard</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-4 h-4 text-slate-500 animate-spin mr-2" />
                        <span className="text-xs text-slate-400">Loading administrators...</span>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {members.map((m) => {
                            const isSelf = m.id === currentUser?.id;
                            const isSuper = m.role === "super_admin";
                            return (
                                <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {m.avatar_url ? (
                                            <img
                                                src={m.avatar_url}
                                                alt={m.name || m.email}
                                                className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-semibold flex items-center justify-center text-xs shrink-0">
                                                {(m.name || m.email).charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-xs font-semibold text-slate-900 truncate">
                                                    {m.name || "Administrator"}
                                                </p>
                                                {isSelf && (
                                                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 truncate">{m.email}</p>
                                        </div>
                                    </div>

                                    {/* Roles & Permissions Badges */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 border ${
                                            isSuper
                                                ? "bg-purple-50 text-purple-700 border-purple-200/80"
                                                : "bg-blue-50 text-blue-700 border-blue-200/80"
                                        }`}>
                                            <Shield className="w-3 h-3" />
                                            {isSuper ? "Super Admin" : m.role === "editor" ? "Editor" : "Viewer"}
                                        </span>

                                        <div className="hidden md:flex flex-wrap gap-1">
                                            {isSuper ? (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                                    Full Access
                                                </span>
                                            ) : (
                                                m.permissions?.map((p) => (
                                                    <span key={p} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">
                                                        {p.replace("manage_", "")}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                setEditingMember(m);
                                                setEditRole(m.role);
                                                setEditPerms(m.permissions || []);
                                            }}
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            Permissions
                                        </Button>

                                        {!isSelf && (
                                            <button
                                                onClick={() => handleRevokeMember(m.id, m.name || m.email)}
                                                className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Revoke access"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pending Invitations Section */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                <div className="pb-3 mb-3 border-b border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-900">Pending Invitations</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        One-time setup links awaiting registration
                    </p>
                </div>

                {invites.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-normal border border-dashed border-slate-200 rounded-lg">
                        No pending invitations. Use "Invite Administrator" to invite colleagues.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {invites.map((inv) => {
                            const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                            const inviteUrl = `${baseUrl}/admin/login?invite=${inv.token}`;

                            return (
                                <div key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                            <p className="text-xs font-semibold text-slate-900 truncate">{inv.email}</p>
                                            <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded text-[10px] font-medium border border-amber-200">
                                                Pending Setup
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                            <span>Role: {inv.role}</span>
                                            <span>&bull;</span>
                                            <span>Expires {new Date(inv.expires_at).toLocaleDateString()}</span>
                                            {inv.invited_by && (
                                                <>
                                                    <span>&bull;</span>
                                                    <span>by {inv.invited_by}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => copyToClipboard(inviteUrl, inv.id)}
                                        >
                                            {copiedToken === inv.id ? (
                                                <>
                                                    <Check className="w-3 h-3 text-emerald-600" />
                                                    <span className="text-emerald-700">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" />
                                                    <span>Copy Link</span>
                                                </>
                                            )}
                                        </Button>

                                        <button
                                            onClick={() => handleCancelInvite(inv.id, inv.email)}
                                            className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Cancel invite"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6 border border-slate-200 my-8">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-slate-600" />
                                Invite Administrator
                            </h2>
                            <button
                                onClick={() => setIsInviteModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {lastInviteResult ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-emerald-950">Invite Generated</p>
                                        <p className="text-xs text-emerald-700 mt-0.5">
                                            {lastInviteResult.message}
                                        </p>
                                    </div>
                                </div>

                                {lastInviteResult.inviteUrl && (
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                                        <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">
                                            One-Time Registration Link
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                readOnly
                                                value={lastInviteResult.inviteUrl}
                                                className="flex-1 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-mono text-slate-800 outline-none"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => copyToClipboard(lastInviteResult.inviteUrl!, "modal")}
                                            >
                                                {copiedToken === "modal" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setLastInviteResult(null);
                                            setIsInviteModalOpen(false);
                                        }}
                                    >
                                        Done
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSendInvite} className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-700 block mb-1">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            required
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-normal outline-none focus:border-slate-400 text-slate-900"
                                            placeholder="teammate@example.com"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        The invitee will receive a single-use setup link to create their credentials.
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-700 block mb-1.5">
                                        Role Tier
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(["editor", "viewer", "super_admin"] as AdminRole[]).map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => handleRoleChange(r)}
                                                className={`p-2.5 rounded-lg border text-left transition-colors ${
                                                    selectedRole === r
                                                        ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                                                        : "border-slate-200 hover:bg-slate-50"
                                                }`}
                                            >
                                                <p className="text-xs font-semibold text-slate-900 capitalize">
                                                    {r === "super_admin" ? "Super Admin" : r}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                    {r === "super_admin" ? "Full access" : r === "editor" ? "Team & Requests" : "Read-only"}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedRole !== "super_admin" && (
                                    <div>
                                        <label className="text-xs font-medium text-slate-700 block mb-1.5">
                                            Granular Permissions
                                        </label>
                                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                            {AVAILABLE_PERMISSIONS.map((p) => {
                                                const checked = selectedPerms.includes(p.id);
                                                return (
                                                    <label
                                                        key={p.id}
                                                        className="flex items-start gap-2.5 cursor-pointer p-1 rounded hover:bg-white transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => togglePermission(p.id)}
                                                            className="mt-0.5 rounded border-slate-300 text-slate-900"
                                                        />
                                                        <div>
                                                            <p className="text-xs font-medium text-slate-900">{p.label}</p>
                                                            <p className="text-[11px] text-slate-500">{p.description}</p>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setIsInviteModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={isSendingInvite}
                                    >
                                        {isSendingInvite ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-3 h-3" />
                                                Send Invite Link
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Permissions Modal */}
            {editingMember && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">Update Permissions</h2>
                                <p className="text-xs text-slate-500">{editingMember.name || editingMember.email}</p>
                            </div>
                            <button
                                onClick={() => setEditingMember(null)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSavePermissions} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-700 block mb-1">
                                    Role
                                </label>
                                <select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value as AdminRole)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-slate-400 text-slate-900"
                                >
                                    <option value="super_admin">Super Admin (All Permissions)</option>
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Viewer</option>
                                    <option value="custom">Custom Permissions</option>
                                </select>
                            </div>

                            {editRole !== "super_admin" && (
                                <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    {AVAILABLE_PERMISSIONS.map((p) => {
                                        const checked = editPerms.includes(p.id);
                                        return (
                                            <label
                                                key={p.id}
                                                className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleEditPermission(p.id)}
                                                    className="rounded border-slate-300 text-slate-900"
                                                />
                                                <span>{p.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setEditingMember(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSavingEdit}
                                >
                                    {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
