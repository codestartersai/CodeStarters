import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Globe,
  Clock,
  FileText,
  ArrowUpRight,
  Sparkles,
  ClipboardList,
  X,
} from "lucide-react";
import { Button } from "@/components/codestarters/Button";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState({
    requests: 0,
    pendingRequests: 0,
    pendingApps: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/dashboard-stats");
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof body.error === "string"
              ? body.error
              : "Failed to fetch statistics. Check permissions and server config.",
          );
        }
        setStats({
          requests: body.requests ?? 0,
          pendingRequests: body.pendingRequests ?? 0,
          pendingApps: body.pendingApps ?? 0,
        });
      } catch (err: unknown) {
        console.error("Dashboard error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse text-center">
          Initializing Dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-12 text-center">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mx-auto mb-6">
          <X className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">{error}</p>
        <Button onClick={() => window.location.reload()} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-500">
          Welcome back. Here's what's happening with CodeStarters today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          to="/admin/requests"
          className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <Globe className="w-8 h-8" />
            </div>
            <div className="p-2 bg-slate-50 rounded-full group-hover:bg-brand-500 group-hover:text-white transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">
            Website Requests
          </p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-5xl font-black text-slate-900">{stats.requests}</h3>
            {stats.pendingRequests > 0 && (
              <span className="text-amber-600 font-bold text-sm bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                {stats.pendingRequests} Pending
              </span>
            )}
          </div>
        </Link>

        <Link
          to="/admin/applications"
          className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div className="p-2 bg-slate-50 rounded-full group-hover:bg-brand-500 group-hover:text-white transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">
            Applications
          </p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-5xl font-black text-slate-900">{stats.pendingApps}</h3>
            <span className="text-slate-400 font-bold text-sm">to review</span>
          </div>
        </Link>
      </div>

      <QuickActions />
    </div>
  );
}

function QuickActions() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-8">
          <Clock className="w-5 h-5 text-brand-500" />
          Quick Actions
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/admin/requests"
            className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 group"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Review Requests</p>
              <p className="text-xs text-slate-500">Respond to website requests</p>
            </div>
          </Link>
          <Link
            to="/admin/applications"
            className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-100 group"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-amber-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Review Applications</p>
              <p className="text-xs text-slate-500">Approve or reject signups</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-brand-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-100 relative overflow-hidden">
        <Sparkles className="absolute top-[-20px] right-[-20px] w-40 h-40 text-brand-500/20 rotate-12" />
        <h3 className="text-xl font-bold mb-4 relative z-10">Founder Tip</h3>
        <p className="text-brand-50 font-medium leading-relaxed mb-6 relative z-10 italic">
          "The goal isn't just to build websites, but to build a community of innovators."
        </p>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full border-2 border-brand-400 p-0.5">
            <div className="w-full h-full bg-brand-400 rounded-full" />
          </div>
          <p className="text-sm font-bold tracking-tight">CodeStarters Mission</p>
        </div>
      </div>
    </div>
  );
}
