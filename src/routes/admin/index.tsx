import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
    Globe,
    Clock,
    FileText,
    ArrowUpRight,
    Sparkles,
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
        <div className="space-y-10">
            {/* Greeting Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Welcome back{admin?.name ? `, ${admin.name.split(" ")[0]}` : ""}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Here's an overview of CodeStarters websites, teams, and member requests.
                    </p>
                </div>

                {/* Email Connector status badge */}
                <Link
                    to="/admin/settings"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all shadow-xs ${
                        emailConnected
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    }`}
                >
                    <span className={`w-2 h-2 rounded-full ${emailConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                    <span>{emailConnected ? "Gmail Connector Ready" : "Email Connector Pending"}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Website Requests */}
                <Link
                    to="/admin/requests"
                    className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Website Requests</p>
                        <div className="flex items-baseline gap-2.5 mt-1">
                            <h3 className="text-3xl font-black text-slate-900">{stats.requests}</h3>
                            {stats.pendingRequests > 0 && (
                                <span className="text-amber-700 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    {stats.pendingRequests} New
                                </span>
                            )}
                        </div>
                    </div>
                </Link>

                {/* Team & Tabs */}
                <Link
                    to="/admin/team"
                    className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Team & Tabs</p>
                        <div className="flex items-baseline gap-2.5 mt-1">
                            <h3 className="text-3xl font-black text-slate-900">{stats.teamMembers > 0 ? stats.teamMembers : 12}</h3>
                            <span className="text-slate-400 text-xs font-bold">Robotics, Web & Leads</span>
                        </div>
                    </div>
                </Link>

                {/* Applications */}
                <Link
                    to="/admin/applications"
                    className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Applications</p>
                        <div className="flex items-baseline gap-2.5 mt-1">
                            <h3 className="text-3xl font-black text-slate-900">{stats.pendingApps}</h3>
                            <span className="text-slate-400 text-xs font-bold">Pending Review</span>
                        </div>
                    </div>
                </Link>

                {/* Access & Invites */}
                <Link
                    to="/admin/members"
                    className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Access & Invites</p>
                        <div className="flex items-baseline gap-2.5 mt-1">
                            <h3 className="text-3xl font-black text-slate-900">Google SSO</h3>
                            <span className="text-emerald-600 text-xs font-bold">Invite Only</span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Quick Actions & Mission Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-brand-600" />
                        Quick Management Actions
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Link
                            to="/admin/team"
                            className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 transition-all group"
                        >
                            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-xs text-slate-500 group-hover:text-emerald-600">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Teams & Tabs</p>
                                <p className="text-xs text-slate-400">Add Robotics, Web & mentors</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/requests"
                            className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 transition-all group"
                        >
                            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-xs text-slate-500 group-hover:text-blue-600">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Website Requests</p>
                                <p className="text-xs text-slate-400">Respond to Cupertino clients</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/members"
                            className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 hover:bg-purple-50/70 border border-slate-100 hover:border-purple-200 transition-all group"
                        >
                            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-xs text-slate-500 group-hover:text-purple-600">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Invite Colleagues</p>
                                <p className="text-xs text-slate-400">Send Google SSO invite links</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/scanner"
                            className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 hover:bg-brand-50/70 border border-slate-100 hover:border-brand-200 transition-all group"
                        >
                            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-xs text-slate-500 group-hover:text-brand-600">
                                <QrCode className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">QR Scanner</p>
                                <p className="text-xs text-slate-400">Event pass check-in</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Mission / Founder Card */}
                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <Sparkles className="absolute -top-6 -right-6 w-36 h-36 text-white/5 rotate-12 pointer-events-none" />
                    <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-400">
                            CodeStarters Mission
                        </span>
                        <h3 className="text-xl font-black mt-2 leading-snug">
                            Empowering youth in CS & lifting Cupertino businesses.
                        </h3>
                        <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                            "The goal isn't just to build websites, but to build a community of high school innovators, mentors, and local leaders."
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
                        <span>Cupertino, California</span>
                        <a
                            href="/team"
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-400 hover:text-brand-300 flex items-center gap-1"
                        >
                            View Public Team <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
