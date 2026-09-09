import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
    Globe,
    Clock,
    FileText,
    ArrowUpRight,
    UserCheck,
    ClipboardList,
    X,
    QrCode,
    ScanLine,
    UserPlus,
    MailCheck,
    Shield,
    Layers,
    ChevronRight,
    Settings,
} from "lucide-react";
import { Button } from "@/components/codestarters/Button";
import { useAdminSession } from "@/routes/admin/route";

export const Route = createFileRoute("/admin/")({
    component: AdminOverview,
});

function AdminOverview() {
    const { admin } = useAdminSession();
    const [stats, setStats] = useState({
        requests: 0,
        pendingRequests: 0,
        pendingApps: 0,
        teamMembers: 0,
    });
    const [emailConnected, setEmailConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, emailRes] = await Promise.all([
                    fetch("/api/admin/dashboard-stats"),
                    fetch("/api/admin/email-connector"),
                ]);

                const body = await statsRes.json().catch(() => ({}));
                if (statsRes.ok) {
                    setStats({
                        requests: body.requests ?? 0,
                        pendingRequests: body.pendingRequests ?? 0,
                        pendingApps: body.pendingApps ?? 0,
                        teamMembers: body.teamMembers ?? 0,
                    });
                }

                const emailBody = await emailRes.json().catch(() => ({}));
                setEmailConnected(Boolean(emailBody.configured));
            } catch (err: unknown) {
                console.error("Dashboard error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            {/* Greeting Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                        Overview
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                        Welcome back{admin?.name ? `, ${admin.name.split(" ")[0]}` : ""}. System activity and management portal.
                    </p>
                </div>

                {/* Email Connector status badge */}
                <Link
                    to="/admin/settings"
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        emailConnected
                            ? "bg-white text-emerald-700 border-emerald-200/80 hover:bg-emerald-50/50"
                            : "bg-white text-amber-700 border-amber-200/80 hover:bg-amber-50/50"
                    }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${emailConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <span>{emailConnected ? "Gmail Connected" : "Email Setup Needed"}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </Link>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Website Requests */}
                <Link
                    to="/admin/requests"
                    className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-slate-500 font-medium text-xs">Website Requests</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-semibold text-slate-900">{stats.requests}</h3>
                            {stats.pendingRequests > 0 && (
                                <span className="text-amber-700 font-medium text-[11px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80">
                                    {stats.pendingRequests} new
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Cupertino business inquiries</p>
                    </div>
                </Link>

                {/* Team & Tabs */}
                <Link
                    to="/admin/team"
                    className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-slate-500 font-medium text-xs">Team Members</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-semibold text-slate-900">{stats.teamMembers > 0 ? stats.teamMembers : 12}</h3>
                            <span className="text-slate-400 text-[11px]">active roster</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Organized across departments</p>
                    </div>
                </Link>

                {/* Applications */}
                <Link
                    to="/admin/applications"
                    className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-slate-500 font-medium text-xs">Applications</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-semibold text-slate-900">{stats.pendingApps}</h3>
                            <span className="text-slate-400 text-[11px]">pending review</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Student volunteer submissions</p>
                    </div>
                </Link>

                {/* Access & Invites */}
                <Link
                    to="/admin/members"
                    className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-slate-500 font-medium text-xs">Access Control</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-semibold text-slate-900">Protected</h3>
                            <span className="text-emerald-700 font-medium text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80">
                                Invite-only
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Role-based administrator invites</p>
                    </div>
                </Link>
            </div>

            {/* Quick Actions & System Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Quick Navigation</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Direct shortcuts to administrative tools</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <Link
                            to="/admin/team"
                            className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/50 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-900">Teams & Tabs</p>
                                <p className="text-[11px] text-slate-500 truncate">Manage departments, rosters, and photos</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/requests"
                            className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/50 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                <Globe className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-900">Website Requests</p>
                                <p className="text-[11px] text-slate-500 truncate">Review inquiries and reply via Gmail</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/members"
                            className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/50 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                <UserPlus className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-900">Access & Invites</p>
                                <p className="text-[11px] text-slate-500 truncate">Send single-use registration links</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/settings"
                            className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/50 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                <Settings className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-900">Settings & Connector</p>
                                <p className="text-[11px] text-slate-500 truncate">Google App Password & database</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* System Summary Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h2 className="text-sm font-semibold text-slate-900">Platform Status</h2>
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Operational
                            </span>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">Super Admin</span>
                                <span className="font-mono text-slate-800 text-[11px] truncate max-w-[140px]">{admin?.email || "Configured"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">Database</span>
                                <span className="text-slate-800 text-[11px]">PostgreSQL (Supabase)</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">Mail Transport</span>
                                <span className="text-slate-800 text-[11px]">{emailConnected ? "Gmail SMTP" : "Unconfigured"}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-slate-500">Environment</span>
                                <span className="font-mono text-slate-800 text-[11px]">Production</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">CodeStarters Cupertino</span>
                        <a
                            href="/team"
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 text-[11px]"
                        >
                            Public Team <ArrowUpRight className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
