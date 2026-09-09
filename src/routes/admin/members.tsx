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
    Sparkles,
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
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Access Control & Invites
                        <span className="text-xs font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-100">
                            {members.length} Active Admins
                        </span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Invite team members with one-use Google SSO links and manage granular permissions.
                    </p>
                </div>

                <Button
                    onClick={() => {
                        setLastInviteResult(null);
                        setIsInviteModalOpen(true);
                    }}
                    className="bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-2 h-11 text-xs font-bold shadow-md shadow-brand-100"
                >
                    <UserPlus className="w-4 h-4" />
                    Invite Admin Member
                </Button>
            </div>

            {/* Email Connector status banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                emailConfigured ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-amber-50/70 border-amber-200 text-amber-900"
            }`}>
                <div className="flex items-center gap-3">
                    <Mail className={`w-5 h-5 ${emailConfigured ? "text-emerald-600" : "text-amber-600"}`} />
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider">
                            {emailConfigured ? "Gmail Connector Active" : "Gmail Connector Pending Configuration"}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                            {emailConfigured
                                ? "Invited members automatically receive an email invitation with their one-use Google SSO link."
                                : "Add GMAIL_USER and GMAIL_APP_PASSWORD to automatically send email invites. You can still copy invite links manually."}
                        </p>
                    </div>
                </div>

                <a
                    href="/admin/settings"
                    className="text-xs font-bold px-3 py-1.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 whitespace-nowrap transition-colors"
                >
                    Email Settings &rarr;
                </a>
            </div>

            {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
                    {errorMessage}
                </div>
            )}

            {/* Active Administrators Section */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">Active Administrators</h2>
                        <p className="text-xs text-slate-400 font-medium">Users with verified access to this dashboard</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-brand-600 animate-spin mr-2" />
                        <span className="text-xs font-bold text-slate-400 uppercase">Loading team...</span>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {members.map((m) => {
                            const isSelf = m.id === currentUser?.id;
                            const isSuper = m.role === "super_admin";
                            return (
                                <div key={m.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        {m.avatar_url ? (
                                            <img
                                                src={m.avatar_url}
                                                alt={m.name || m.email}
                                                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-11 h-11 rounded-xl bg-brand-100 text-brand-700 font-black flex items-center justify-center text-sm shrink-0">
                                                {(m.name || m.email).charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-black text-slate-900 truncate">
                                                    {m.name || "Administrator"}
                                                </p>
                                                {isSelf && (
                                                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium truncate">{m.email}</p>
                                        </div>
                                    </div>

                                    {/* Roles & Permissions Badges */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                                            isSuper
                                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                : "bg-blue-50 text-blue-700 border border-blue-200"
                                        }`}>
                                            <Shield className="w-3 h-3" />
                                            {isSuper ? "Super Admin" : m.role === "editor" ? "Editor" : "Viewer"}
                                        </span>

                                        <div className="hidden md:flex flex-wrap gap-1">
                                            {isSuper ? (
                                                <span className="text-[11px] px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md font-medium">
                                                    All Permissions
                                                </span>
                                            ) : (
                                                m.permissions?.map((p) => (
                                                    <span key={p} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                                                        {p.replace("manage_", "")}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        <button
                                            onClick={() => {
                                                setEditingMember(m);
                                                setEditRole(m.role);
                                                setEditPerms(m.permissions || []);
                                            }}
                                            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
                                        >
                                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                            Permissions
                                        </button>

                                        {!isSelf && (
                                            <button
                                                onClick={() => handleRevokeMember(m.id, m.name || m.email)}
                                                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                title="Revoke access"
                                            >
                                                <Trash2 className="w-4 h-4" />
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
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">Pending Google SSO Invitations</h2>
                        <p className="text-xs text-slate-400 font-medium">
                            One-use invitations awaiting sign-in from the invited Google account
                        </p>
                    </div>
                </div>

                {invites.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl">
                        No pending invitations. Click "Invite Admin Member" above to add new colleagues.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {invites.map((inv) => {
                            const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                            const inviteUrl = `${baseUrl}/admin/login?invite=${inv.token}`;

                            return (
                                <div key={inv.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-brand-600 shrink-0" />
                                            <p className="text-sm font-black text-slate-900 truncate">{inv.email}</p>
                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10px] font-bold border border-amber-200">
                                                Awaiting SSO
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                            <span>Role: <strong>{inv.role}</strong></span>
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

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => copyToClipboard(inviteUrl, inv.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors"
                                        >
                                            {copiedToken === inv.id ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span className="text-emerald-700">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>Copy Link</span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => handleCancelInvite(inv.id, inv.email)}
                                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Cancel invite"
                                        >
                                            <Trash2 className="w-4 h-4" />
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
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-brand-600" />
                                Invite Team Member via Google SSO
                            </h2>
                            <button
                                onClick={() => setIsInviteModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {lastInviteResult ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900">Invite Generated!</p>
                                        <p className="text-xs text-emerald-700 leading-relaxed mt-0.5">
                                            {lastInviteResult.message}
                                        </p>
                                    </div>
                                </div>

                                {lastInviteResult.inviteUrl && (
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            Single-Use Google SSO Link
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                readOnly
                                                value={lastInviteResult.inviteUrl}
                                                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none"
                                            />
                                            <Button
                                                onClick={() => copyToClipboard(lastInviteResult.inviteUrl!, "modal")}
                                                className="h-9 px-3 text-xs font-bold"
                                            >
                                                {copiedToken === "modal" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        onClick={() => {
                                            setLastInviteResult(null);
                                            setIsInviteModalOpen(false);
                                        }}
                                        className="text-xs font-bold h-10 px-5"
                                    >
                                        Done
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSendInvite} className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                        Google Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                            placeholder="teammate@gmail.com"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        They will authenticate with this exact Google account via SSO.
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                                        Role Tier
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(["editor", "viewer", "super_admin"] as AdminRole[]).map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => handleRoleChange(r)}
                                                className={`p-3 rounded-xl border text-left transition-all ${
                                                    selectedRole === r
                                                        ? "border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20"
                                                        : "border-slate-200 hover:bg-slate-50"
                                                }`}
                                            >
                                                <p className="text-xs font-bold text-slate-900 capitalize">
                                                    {r === "super_admin" ? "Super Admin" : r}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    {r === "super_admin" ? "Full system access" : r === "editor" ? "Team & Requests" : "Read-only"}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedRole !== "super_admin" && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                                            Granular Permissions
                                        </label>
                                        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                            {AVAILABLE_PERMISSIONS.map((p) => {
                                                const checked = selectedPerms.includes(p.id);
                                                return (
                                                    <label
                                                        key={p.id}
                                                        className="flex items-start gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-white/80 transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => togglePermission(p.id)}
                                                            className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                                        />
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">{p.label}</p>
                                                            <p className="text-[11px] text-slate-500 leading-tight">{p.description}</p>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setIsInviteModalOpen(false)}
                                        className="h-11 px-5 text-xs font-bold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSendingInvite}
                                        className="h-11 px-6 text-xs font-bold bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-100 flex items-center gap-2"
                                    >
                                        {isSendingInvite ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-3.5 h-3.5" />
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
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Update Permissions</h2>
                                <p className="text-xs text-slate-500">{editingMember.name || editingMember.email}</p>
                            </div>
                            <button
                                onClick={() => setEditingMember(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSavePermissions} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Role
                                </label>
                                <select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value as AdminRole)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none"
                                >
                                    <option value="super_admin">Super Admin (All Permissions)</option>
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Viewer</option>
                                    <option value="custom">Custom Permissions</option>
                                </select>
                            </div>

                            {editRole !== "super_admin" && (
                                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                                    {AVAILABLE_PERMISSIONS.map((p) => {
                                        const checked = editPerms.includes(p.id);
                                        return (
                                            <label
                                                key={p.id}
                                                className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleEditPermission(p.id)}
                                                    className="rounded border-slate-300 text-brand-600"
                                                />
                                                <span>{p.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setEditingMember(null)}
                                    className="h-10 px-4 text-xs font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSavingEdit}
                                    className="h-10 px-5 text-xs font-bold bg-brand-600 hover:bg-brand-700"
                                >
                                    {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
