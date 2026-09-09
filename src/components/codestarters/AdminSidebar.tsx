import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
    LayoutDashboard,
    Globe,
    ClipboardList,
    UserCheck,
    LogOut,
    Menu,
    X,
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
        ? "Editor"
        : admin?.role === "viewer"
        ? "Viewer"
        : "Admin";

    const filteredItems = MENU_ITEMS.filter((item) => {
        if (!item.permission) return true;
        return can(item.permission);
    });

    return (
        <>
            {/* Mobile hamburger trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation"
                className="lg:hidden fixed bottom-5 right-5 z-50 w-11 h-11 bg-zinc-900 text-white rounded-lg shadow-lg flex items-center justify-center transition-colors"
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col
                ${isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
            `}>
                <div className="p-5 flex flex-col h-full overflow-y-auto">
                    {/* Brand Header */}
                    <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-zinc-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                                CS
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900 tracking-tight leading-none">CodeStarters</h2>
                                <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">Admin Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 space-y-0.5">
                        {filteredItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors
                                        ${isActive
                                            ? "bg-slate-900 text-white font-semibold"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"}
                                    `}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                                        <span className="truncate">{item.name}</span>
                                    </div>
                                    {item.badge && !isActive && (
                                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom User Profile & Sign Out */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                        <div className="px-2 py-1.5 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center justify-center text-xs shrink-0">
                                {(admin?.name || admin?.email || "A").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                    <p className="text-xs font-semibold text-slate-900 truncate">
                                        {admin?.name || "Admin"}
                                    </p>
                                    {admin?.role === "super_admin" && (
                                        <Shield className="w-3 h-3 text-purple-600 shrink-0" />
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 truncate">
                                    {admin?.email}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50/60 rounded-md transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/20 backdrop-blur-xs z-30 lg:hidden"
                />
            )}
        </>
    );
}
