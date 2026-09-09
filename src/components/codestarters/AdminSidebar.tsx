import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
    LayoutDashboard,
    Globe,
    ClipboardList,
    ScanLine,
    UserCheck,
    LogOut,
    Menu,
    X,
    ChevronRight,
    QrCode,
    Ticket,
    Users,
    Shield,
    MailCheck,
    UserPlus,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase/browser";
import { useAdminSession } from "@/routes/admin/route";
import type { AdminPermission } from "@/lib/admin-auth";

type MenuItem = {
    name: string;
    href: string;
    icon: typeof LayoutDashboard;
    permission?: AdminPermission;
    badge?: string;
};

const MENU_ITEMS: MenuItem[] = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Teams & Tabs", href: "/admin/team", icon: UserCheck, permission: "manage_team" },
    { name: "Website Requests", href: "/admin/requests", icon: Globe, permission: "manage_requests" },
    { name: "Applications", href: "/admin/applications", icon: ClipboardList, permission: "manage_applications" },
    { name: "Access & Invites", href: "/admin/members", icon: UserPlus, permission: "manage_admins" },
    { name: "Email & Settings", href: "/admin/settings", icon: MailCheck, permission: "manage_admins" },
];

export function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const [isOpen, setIsOpen] = useState(false);
    const { admin, can } = useAdminSession();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate({ to: "/admin/login" });
    };

    const roleLabel = admin?.role === "super_admin"
        ? "Super Admin"
        : admin?.role === "editor"
        ? "Team Editor"
        : admin?.role === "viewer"
        ? "Viewer"
        : "Staff";

    const filteredItems = MENU_ITEMS.filter((item) => {
        if (!item.permission) return true;
        return can(item.permission);
    });

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation"
                className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <aside className={`
                fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col
                ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
            `}>
                <div className="p-6 flex flex-col h-full overflow-y-auto">
                    {/* Brand Header */}
                    <div className="flex items-center gap-3 px-2 mb-8">
                        <div className="w-10 h-10 bg-brand-50 border border-brand-100/60 rounded-2xl p-1.5 flex items-center justify-center shrink-0">
                            <span className="text-brand-700 font-black text-sm tracking-tight">CS</span>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-black text-slate-900 leading-none truncate">CodeStarters</h2>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Admin Dashboard</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 space-y-1">
                        {filteredItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 group text-sm font-bold
                                        ${isActive
                                            ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
                                    `}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"}`} />
                                        <span className="truncate">{item.name}</span>
                                    </div>
                                    {isActive ? (
                                        <ChevronRight className="w-4 h-4 opacity-70" />
                                    ) : item.badge ? (
                                        <span className="text-[10px] uppercase font-bold bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
                                            {item.badge}
                                        </span>
                                    ) : null}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom User Profile & Sign Out */}
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center gap-3">
                            {admin?.avatar_url ? (
                                <img
                                    src={admin.avatar_url}
                                    alt={admin.name || "User"}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-black flex items-center justify-center text-sm">
                                    {(admin?.name || admin?.email || "A").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-black text-slate-900 truncate">
                                        {admin?.name || "Admin"}
                                    </p>
                                    {admin?.role === "super_admin" && (
                                        <Shield className="w-3 h-3 text-brand-600 shrink-0" />
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium truncate">
                                    {admin?.email || "Signed in"}
                                </p>
                                <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-brand-50 text-brand-700 rounded-md">
                                    {roleLabel}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-all group"
                        >
                            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 lg:hidden"
                />
            )}
        </>
    );
}
