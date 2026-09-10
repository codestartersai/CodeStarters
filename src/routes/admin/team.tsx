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
    Check,
    X,
    Users,
    Layers,
    ArrowUpRight,
    Camera,
    Settings,
} from "lucide-react";
import { Button } from "@/components/codestarters/Button";
import type { TeamCategory, TeamMember } from "@/routes/api/admin/teams";

const PRESET_IMAGES = [
    { label: "Smaran", url: "/smaran.png" },
    { label: "Amogh", url: "/amogh.webp" },
    { label: "Reyansh Nankani", url: "/team/reyansh-nankani.png" },
    { label: "Pranav C", url: "/team/pranav-c.png" },
    { label: "Aljer Almazan", url: "/team/aljer-almazan.webp" },
    { label: "Carter Chang", url: "/team/carter-chang.png" },
    { label: "Mridhula Ganesh", url: "/team/mridhula-ganesh-kumar.webp" },
    { label: "Aidan", url: "/aidan.webp" },
    { label: "Arnav", url: "/arnav.webp" },
    { label: "Robin", url: "/team/robin-zhou.png" },
    { label: "Sai", url: "/sai.webp" },
    { label: "Shaurya Gakhar", url: "/team/shaurya-gakhar.png" },
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
    const [editingCategory, setEditingCategory] = useState<TeamCategory | null>(null);

    // Form states for Member
    const [memberName, setMemberName] = useState("");
    const [memberRole, setMemberRole] = useState("");
    const [memberCategory, setMemberCategory] = useState("");
    const [memberImage, setMemberImage] = useState("");
    const [memberBio, setMemberBio] = useState("");
    const [memberLinks, setMemberLinks] = useState("");
    const [memberOrder, setMemberOrder] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Form states for Category (Add / Edit)
    const [tabName, setTabName] = useState("");
    const [tabDesc, setTabDesc] = useState("");
    const [tabOrder, setTabOrder] = useState(1);
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

    const openCreateTabModal = () => {
        setEditingCategory(null);
        setTabName("");
        setTabDesc("");
        setTabOrder(categories.length + 1);
        setIsTabModalOpen(true);
    };

    const openEditTabModal = (cat: TeamCategory) => {
        setEditingCategory(cat);
        setTabName(cat.name);
        setTabDesc(cat.description || "");
        setTabOrder(cat.order_index ?? 1);
        setIsTabModalOpen(true);
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
                            name: memberName.trim(),
                            role: memberRole.trim(),
                            category_id: memberCategory,
                            image_url: memberImage || null,
                            bio: memberBio.trim() || null,
                            social_links: memberLinks.trim() || null,
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
                            name: memberName.trim(),
                            role: memberRole.trim(),
                            category_id: memberCategory,
                            image_url: memberImage || null,
                            bio: memberBio.trim() || null,
                            social_links: memberLinks.trim() || null,
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

    const handleSaveTab = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tabName.trim()) return;
        setIsSavingTab(true);
        try {
            if (editingCategory) {
                // Update
                const res = await fetch("/api/admin/teams", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "category",
                        id: editingCategory.id,
                        updates: {
                            name: tabName.trim(),
                            description: tabDesc.trim() || null,
                            order_index: Number(tabOrder),
                        },
                    }),
                });
                if (!res.ok) throw new Error("Failed to update team tab.");
            } else {
                // Create
                const res = await fetch("/api/admin/teams", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "category",
                        category: {
                            name: tabName.trim(),
                            description: tabDesc.trim() || undefined,
                            order_index: Number(tabOrder),
                        },
                    }),
                });
                if (!res.ok) throw new Error("Failed to create team tab.");
            }

            setIsTabModalOpen(false);
            setEditingCategory(null);
            setTabName("");
            setTabDesc("");
            await loadTeamData();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Error saving tab.");
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

    // Client-side smart image compression via HTML5 canvas
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const rawData = event.target?.result as string;
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                const maxDim = 600;

                if (width > height && width > maxDim) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else if (height > maxDim) {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    try {
                        const compressed = canvas.toDataURL("image/webp", 0.85);
                        setMemberImage(compressed);
                    } catch {
                        setMemberImage(canvas.toDataURL("image/jpeg", 0.85));
                    }
                } else {
                    setMemberImage(rawData);
                }
            };
            img.src = rawData;
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                            Teams & Tabs
                        </h1>
                        <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                            {members.length} members
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">
                        Manage departments, staff rosters, headshots, and member ordering.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={openCreateTabModal}
                        variant="secondary"
                        size="sm"
                    >
                        <FolderPlus className="w-3.5 h-3.5" />
                        Add Category
                    </Button>

                    <Button
                        onClick={openCreateMemberModal}
                        size="sm"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add Member
                    </Button>
                </div>
            </div>

            {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
                    {errorMessage}
                </div>
            )}

            {/* Department Navigation Bar */}
            <div className="border-b border-slate-200 pb-2 flex items-center gap-1.5 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                        activeTab === "all"
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                >
                    <Layers className="w-3.5 h-3.5" />
                    <span>All Departments</span>
                    <span className={`text-[10px] font-mono px-1.5 rounded ${activeTab === "all" ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-600"}`}>
                        {members.length}
                    </span>
                </button>

                {categories.map((cat) => {
                    const count = members.filter((m) => m.category_id === cat.id).length;
                    const isActive = activeTab === cat.id;
                    return (
                        <div key={cat.id} className="flex items-center">
                            <button
                                onClick={() => setActiveTab(cat.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                    isActive
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                }`}
                            >
                                <span>{cat.name}</span>
                                <span className={`text-[10px] font-mono px-1.5 rounded ${isActive ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-600"}`}>
                                    {count}
                                </span>
                            </button>

                            {isActive && (
                                <div className="flex items-center ml-0.5">
                                    <button
                                        onClick={() => openEditTabModal(cat)}
                                        title="Edit category"
                                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                                    >
                                        <Edit3 className="w-3 h-3" />
                                    </button>
                                    {cat.id !== "leadership" && (
                                        <button
                                            onClick={() => handleDeleteTab(cat.id, cat.name)}
                                            title="Delete category"
                                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search roster..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-normal outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400 transition-colors"
                    />
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                    Showing {filteredMembers.length} {activeTab === "all" ? "members" : `in ${activeCatObj?.name || activeTab}`}
                </div>
            </div>

            {/* Member Cards Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200/80">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin mb-2" />
                    <p className="text-xs text-slate-400">Loading team roster...</p>
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200/80 p-6">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">No members found</h3>
                    <p className="text-slate-500 text-xs max-w-xs mx-auto mt-1 mb-4">
                        {searchTerm ? "No members match your search query." : "No members have been added to this department yet."}
                    </p>
                    <Button onClick={openCreateMemberModal} size="sm">
                        <UserPlus className="w-3.5 h-3.5" /> Add First Member
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredMembers.map((m) => {
                        const cat = categories.find((c) => c.id === m.category_id);
                        return (
                            <div
                                key={m.id}
                                className="bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors overflow-hidden flex flex-col group"
                            >
                                {/* Photo Header */}
                                <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                                    {m.image_url ? (
                                        <img
                                            src={m.image_url}
                                            alt={m.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-semibold text-lg">
                                            {m.name.charAt(0)}
                                        </div>
                                    )}

                                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-xs p-1 rounded-md border border-slate-200 shadow-xs">
                                        <button
                                            onClick={() => openEditMemberModal(m)}
                                            className="p-1 text-slate-600 hover:text-slate-950 rounded transition-colors"
                                            title="Edit member"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMember(m.id, m.name)}
                                            className="p-1 text-slate-600 hover:text-red-600 rounded transition-colors"
                                            title="Delete member"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <span className="absolute bottom-2 left-2 text-[10px] font-medium px-2 py-0.5 bg-white/95 backdrop-blur-xs text-slate-700 rounded border border-slate-200/80 shadow-xs">
                                        {cat?.name || m.category_id}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900 leading-snug">{m.name}</h3>
                                        <p className="text-xs text-slate-600 mt-0.5 font-medium">{m.role}</p>

                                        {m.bio && (
                                            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                                {m.bio}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                                        {m.social_links ? (
                                            <a
                                                href={m.social_links.startsWith("http") ? m.social_links : `https://${m.social_links}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-[11px] font-medium truncate max-w-[150px]"
                                            >
                                                <ExternalLink className="w-3 h-3 shrink-0" />
                                                <span className="truncate">Profile Link</span>
                                            </a>
                                        ) : (
                                            <span className="text-[11px] text-slate-400">No link</span>
                                        )}
                                        <span className="text-[10px] font-mono text-slate-400">#{m.order_index}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Member Modal */}
            {isMemberModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6 border border-slate-200 my-8">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                            <h2 className="text-base font-semibold text-slate-900">
                                {editingMember ? "Edit Member" : "Add Team Member"}
                            </h2>
                            <button
                                onClick={() => setIsMemberModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveMember} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-700 block mb-1">
                                    Full Name *
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={memberName}
                                    onChange={(e) => setMemberName(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
                                    placeholder="e.g. Alex Chen"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-700 block mb-1">
                                    Role / Title *
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={memberRole}
                                    onChange={(e) => setMemberRole(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
                                    placeholder="e.g. Lead Instructor"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-700 block mb-1">
                                        Department Category *
                                    </label>
                                    <select
                                        value={memberCategory}
                                        onChange={(e) => setMemberCategory(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-slate-400 text-slate-900"
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-700 block mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={memberOrder}
                                        onChange={(e) => setMemberOrder(Number(e.target.value))}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Headshot & Image Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700 block">
                                    Headshot Photo
                                </label>

                                {memberImage && (
                                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                        <img
                                            src={memberImage}
                                            alt="Preview"
                                            className="w-11 h-11 rounded-md object-cover border border-slate-300 shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-slate-800 truncate">
                                                {memberImage.startsWith("data:") ? "Optimized Headshot" : memberImage}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setMemberImage("")}
                                                className="text-[11px] text-red-600 hover:underline mt-0.5"
                                            >
                                                Remove Photo
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={memberImage.startsWith("data:") ? "" : memberImage}
                                        onChange={(e) => setMemberImage(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
                                        placeholder="Paste image URL (/team/... or https://...)"
                                    />

                                    <div className="flex items-center gap-2">
                                        <select
                                            onChange={(e) => {
                                                if (e.target.value) setMemberImage(e.target.value);
                                            }}
                                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-slate-400"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>
                                                Select preset avatar...
                                            </option>
                                            {PRESET_IMAGES.map((img) => (
                                                <option key={img.url} value={img.url}>
                                                    {img.label} ({img.url})
                                                </option>
                                            ))}
                                        </select>

                                        <label className="cursor-pointer px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0">
                                            <Camera className="w-3.5 h-3.5" />
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
                                <label className="text-xs font-medium text-slate-700 block mb-1">
                                    Bio / Summary (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={memberBio}
                                    onChange={(e) => setMemberBio(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
                                    placeholder="Brief background..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-700 block mb-1">
                                    Social / Website Link (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={memberLinks}
                                    onChange={(e) => setMemberLinks(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
                                    placeholder="https://linkedin.com/in/... or github.com/..."
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsMemberModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editingMember ? "Save Changes" : "Create Member"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add / Edit Team Tab Modal */}
            {isTabModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <FolderPlus className="w-4 h-4 text-slate-600" />
                                {editingCategory ? "Edit Category" : "Add Team Category"}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsTabModalOpen(false);
                                    setEditingCategory(null);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTab} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-700 block mb-1">
                                    Category Name *
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={tabName}
                                    onChange={(e) => setTabName(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
                                    placeholder="e.g. Robotics, Web Dev, Mentors"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-700 block mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={tabDesc}
                                    onChange={(e) => setTabDesc(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
                                    placeholder="Describe this department's role..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-700 block mb-1">
                                    Order Index
                                </label>
                                <input
                                    type="number"
                                    value={tabOrder}
                                    onChange={(e) => setTabOrder(Number(e.target.value))}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setIsTabModalOpen(false);
                                        setEditingCategory(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSavingTab}
                                >
                                    {isSavingTab ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editingCategory ? "Save Changes" : "Create Category"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

