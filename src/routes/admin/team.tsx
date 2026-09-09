import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
    Loader2,
    Search,
    UserPlus,
    FolderPlus,
    Edit3,
    Trash2,
    ExternalLink,
    Upload,
    Sparkles,
    Check,
    X,
    Users,
    Layers,
    ArrowUpRight,
    Camera,
} from "lucide-react";
import { Button } from "@/components/codestarters/Button";
import type { TeamCategory, TeamMember } from "@/routes/api/admin/teams";

const PRESET_IMAGES = [
    { label: "Smaran", url: "/smaran.png" },
    { label: "Amogh", url: "/amogh.webp" },
    { label: "Aidan", url: "/aidan.webp" },
    { label: "Arnav", url: "/arnav.webp" },
    { label: "Robin", url: "/team/robin-zhou.png" },
    { label: "Sai", url: "/sai.webp" },
    { label: "Shaurya Gakhar", url: "/team/shaurya-gakhar.png" },
    { label: "Shreesh Basu", url: "/team/shreesh-basu.png" },
    { label: "Reyansh Nankani", url: "/team/reyansh-nankani.png" },
    { label: "Pranav Chintalapati", url: "/team/pranav-c.png" },
    { label: "Michael Cutsail", url: "/team/michael-cutsail.png" },
    { label: "Arham Desai", url: "/team/arham-desai.png" },
    { label: "Yussef", url: "/team/yussef.webp" },
];

export const Route = createFileRoute("/admin/team")({
    component: AdminTeamsPage,
});

function AdminTeamsPage() {
    const [categories, setCategories] = useState<TeamCategory[]>([]);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Modals
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [isTabModalOpen, setIsTabModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    // Form states
    const [memberName, setMemberName] = useState("");
    const [memberRole, setMemberRole] = useState("");
    const [memberCategory, setMemberCategory] = useState("");
    const [memberImage, setMemberImage] = useState("");
    const [memberBio, setMemberBio] = useState("");
    const [memberLinks, setMemberLinks] = useState("");
    const [memberOrder, setMemberOrder] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // New Tab form
    const [tabName, setTabName] = useState("");
    const [tabDesc, setTabDesc] = useState("");
    const [isSavingTab, setIsSavingTab] = useState(false);

    const loadTeamData = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const res = await fetch("/api/admin/teams");
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to load team data.");

            const cats = (data.categories as TeamCategory[]) || [];
            const mems = (data.members as TeamMember[]) || [];
            setCategories(cats);
            setMembers(mems);

            if (cats.length > 0 && activeTab === "all") {
                // Keep 'all' or default
            }
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : "Error loading team.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadTeamData();
    }, []);

    const openCreateMemberModal = () => {
        setEditingMember(null);
        setMemberName("");
        setMemberRole("");
        setMemberCategory(activeTab === "all" ? (categories[0]?.id || "leadership") : activeTab);
        setMemberImage("");
        setMemberBio("");
        setMemberLinks("");
        setMemberOrder(members.length + 1);
        setIsMemberModalOpen(true);
    };

    const openEditMemberModal = (m: TeamMember) => {
        setEditingMember(m);
        setMemberName(m.name);
        setMemberRole(m.role);
        setMemberCategory(m.category_id);
        setMemberImage(m.image_url || "");
        setMemberBio(m.bio || "");
        setMemberLinks(m.social_links || "");
        setMemberOrder(m.order_index ?? 1);
        setIsMemberModalOpen(true);
    };

    const handleSaveMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingMember) {
                // Update
                const res = await fetch("/api/admin/teams", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "member",
                        id: editingMember.id,
                        updates: {
                            name: memberName,
                            role: memberRole,
                            category_id: memberCategory,
                            image_url: memberImage || null,
                            bio: memberBio || null,
                            social_links: memberLinks || null,
                            order_index: Number(memberOrder),
                        },
                    }),
                });
                if (!res.ok) throw new Error("Failed to update team member.");
            } else {
                // Create
                const res = await fetch("/api/admin/teams", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "member",
                        member: {
                            name: memberName,
                            role: memberRole,
                            category_id: memberCategory,
                            image_url: memberImage || null,
                            bio: memberBio || null,
                            social_links: memberLinks || null,
                            order_index: Number(memberOrder),
                        },
                    }),
                });
                if (!res.ok) throw new Error("Failed to add team member.");
            }

            setIsMemberModalOpen(false);
            await loadTeamData();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Error saving member.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteMember = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name} from the team?`)) return;
        try {
            const res = await fetch(`/api/admin/teams?type=member&id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to remove member.");
            setMembers(members.filter((m) => m.id !== id));
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Error removing member.");
        }
    };

    const handleCreateTab = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tabName.trim()) return;
        setIsSavingTab(true);
        try {
            const res = await fetch("/api/admin/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "category",
                    category: {
                        name: tabName.trim(),
                        description: tabDesc.trim() || undefined,
                        order_index: categories.length + 1,
                    },
                }),
            });
            if (!res.ok) throw new Error("Failed to create team tab.");

            setIsTabModalOpen(false);
            setTabName("");
            setTabDesc("");
            await loadTeamData();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Error creating tab.");
        } finally {
            setIsSavingTab(false);
        }
    };

    const handleDeleteTab = async (id: string, name: string) => {
        if (!confirm(`Delete tab "${name}" and all members inside it?`)) return;
        try {
            const res = await fetch(`/api/admin/teams?type=category&id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete tab.");
            setActiveTab("all");
            await loadTeamData();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Error deleting tab.");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setMemberImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Filter members based on active tab and search
    const filteredMembers = members.filter((m) => {
        const matchesTab = activeTab === "all" || m.category_id === activeTab;
        const matchesSearch =
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.role.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const activeCatObj = categories.find((c) => c.id === activeTab);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Teams & Tabs Manager
                        <span className="text-xs font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-100">
                            {members.length} Members
                        </span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Organize team categories (like Robotics, Web Dev, Leadership), add members, and upload photos.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={() => setIsTabModalOpen(true)}
                        variant="secondary"
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2 h-11 text-xs font-bold"
                    >
                        <FolderPlus className="w-4 h-4 text-brand-600" />
                        Add Team Tab
                    </Button>

                    <Button
                        onClick={openCreateMemberModal}
                        className="bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-2 h-11 text-xs font-bold shadow-md shadow-brand-100"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Member
                    </Button>
                </div>
            </div>

            {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
                    {errorMessage}
                </div>
            )}

            {/* Tabs Bar */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                        activeTab === "all"
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    <Layers className="w-3.5 h-3.5" />
                    All Departments ({members.length})
                </button>

                {categories.map((cat) => {
                    const count = members.filter((m) => m.category_id === cat.id).length;
                    const isActive = activeTab === cat.id;
                    return (
                        <div key={cat.id} className="flex items-center">
                            <button
                                onClick={() => setActiveTab(cat.id)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                                    isActive
                                        ? "bg-brand-600 text-white shadow-sm"
                                        : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                <span>{cat.name}</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                        isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>

                            {isActive && cat.id !== "leadership" && (
                                <button
                                    onClick={() => handleDeleteTab(cat.id, cat.name)}
                                    title="Delete tab"
                                    className="ml-1 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Search Bar & Active Tab Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by member name or title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                    />
                </div>

                <div className="text-xs text-slate-500 font-medium">
                    Showing <strong>{filteredMembers.length}</strong> {activeTab === "all" ? "total members" : `in ${activeCatObj?.name || activeTab}`}
                </div>
            </div>

            {/* Member Cards Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading team members...</p>
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">No members found</h3>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">
                        {searchTerm ? "No team members match your search criteria." : "There are no members in this tab yet."}
                    </p>
                    <Button onClick={openCreateMemberModal} className="text-xs font-bold h-10 px-4">
                        <UserPlus className="w-4 h-4 mr-2" /> Add First Member
                    </Button>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredMembers.map((m) => {
                        const cat = categories.find((c) => c.id === m.category_id);
                        return (
                            <div
                                key={m.id}
                                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
                            >
                                {/* Photo Header */}
                                <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                    {m.image_url ? (
                                        <img
                                            src={m.image_url}
                                            alt={m.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-black text-2xl">
                                            {m.name.charAt(0)}
                                        </div>
                                    )}

                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/70 backdrop-blur-md p-1.5 rounded-xl">
                                        <button
                                            onClick={() => openEditMemberModal(m)}
                                            className="p-1 text-white hover:text-brand-300 transition-colors"
                                            title="Edit member"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMember(m.id, m.name)}
                                            className="p-1 text-white hover:text-red-400 transition-colors"
                                            title="Delete member"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <span className="absolute bottom-3 left-3 text-[11px] font-bold px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-800 rounded-lg shadow-sm">
                                        {cat?.name || m.category_id}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 leading-snug">{m.name}</h3>
                                        <p className="text-xs font-bold text-brand-600 mt-0.5">{m.role}</p>

                                        {m.bio && (
                                            <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                                                {m.bio}
                                            </p>
                                        )}
                                    </div>

                                    {m.social_links && (
                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                            <a
                                                href={m.social_links.startsWith("http") ? m.social_links : `https://${m.social_links}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-slate-400 hover:text-brand-600 flex items-center gap-1 font-bold truncate max-w-[180px]"
                                            >
                                                <ExternalLink className="w-3 h-3 shrink-0" />
                                                <span className="truncate">Profile / Link</span>
                                            </a>
                                            <span className="text-[10px] font-bold text-slate-400">Order #{m.order_index}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Member Modal */}
            {isMemberModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900">
                                {editingMember ? "Edit Team Member" : "Add New Team Member"}
                            </h2>
                            <button
                                onClick={() => setIsMemberModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveMember} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Full Name *
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={memberName}
                                    onChange={(e) => setMemberName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    placeholder="e.g. Alex Chen"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Role / Title *
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={memberRole}
                                    onChange={(e) => setMemberRole(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    placeholder="e.g. Robotics Firmware Lead"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                        Team Tab / Category *
                                    </label>
                                    <select
                                        value={memberCategory}
                                        onChange={(e) => setMemberCategory(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                        Order Index
                                    </label>
                                    <input
                                        type="number"
                                        value={memberOrder}
                                        onChange={(e) => setMemberOrder(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    />
                                </div>
                            </div>

                            {/* Headshot & Image Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                    Headshot Image
                                </label>

                                {memberImage && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                                        <img
                                            src={memberImage}
                                            alt="Preview"
                                            className="w-14 h-14 rounded-xl object-cover border border-slate-300 shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-slate-800 truncate">{memberImage.substring(0, 40)}...</p>
                                            <button
                                                type="button"
                                                onClick={() => setMemberImage("")}
                                                className="text-[11px] font-bold text-red-600 hover:underline mt-0.5"
                                            >
                                                Remove Photo
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={memberImage}
                                        onChange={(e) => setMemberImage(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                        placeholder="Paste image URL (e.g. /team/pranav-c.png or https://...)"
                                    />

                                    <div className="flex items-center gap-2">
                                        {/* Preset picker */}
                                        <select
                                            onChange={(e) => {
                                                if (e.target.value) setMemberImage(e.target.value);
                                            }}
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>
                                                Select from existing photos...
                                            </option>
                                            {PRESET_IMAGES.map((img) => (
                                                <option key={img.url} value={img.url}>
                                                    {img.label} ({img.url})
                                                </option>
                                            ))}
                                        </select>

                                        {/* Local File Upload */}
                                        <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
                                            <Camera className="w-3.5 h-3.5 text-brand-600" />
                                            <span>Upload</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Bio / Summary (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={memberBio}
                                    onChange={(e) => setMemberBio(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    placeholder="Brief background or achievements..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Social / Website Link (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={memberLinks}
                                    onChange={(e) => setMemberLinks(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    placeholder="https://linkedin.com/in/... or github.com/..."
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsMemberModalOpen(false)}
                                    className="h-11 px-5 text-xs font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="h-11 px-6 text-xs font-bold bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-100"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingMember ? "Save Changes" : "Create Member"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Team Tab Modal */}
            {isTabModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <FolderPlus className="w-5 h-5 text-brand-600" />
                                Add Team Category / Tab
                            </h2>
                            <button
                                onClick={() => setIsTabModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTab} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Tab Name *
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={tabName}
                                    onChange={(e) => setTabName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    placeholder="e.g. Robotics Team, Web Development"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={tabDesc}
                                    onChange={(e) => setTabDesc(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    placeholder="Describe the department's purpose..."
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsTabModalOpen(false)}
                                    className="h-11 px-5 text-xs font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSavingTab}
                                    className="h-11 px-6 text-xs font-bold bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-100"
                                >
                                    {isSavingTab ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Tab"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
