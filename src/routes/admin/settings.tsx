import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
    Mail,
    CheckCircle2,
    XCircle,
    Loader2,
    Send,
    Key,
    ExternalLink,
    Database,
    Shield,
    Copy,
    Check,
    HelpCircle,
} from "lucide-react";
import { Button } from "@/components/codestarters/Button";

export const Route = createFileRoute("/admin/settings")({
    component: AdminSettingsPage,
});

function AdminSettingsPage() {
    const [connectorStatus, setConnectorStatus] = useState<{
        configured: boolean;
        user?: string | null;
        error?: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [testEmailTo, setTestEmailTo] = useState("");
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
    const [copiedEnv, setCopiedEnv] = useState(false);

    const checkStatus = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/email-connector");
            const data = await res.json().catch(() => ({}));
            setConnectorStatus({
                configured: Boolean(data.configured),
                user: data.user,
                error: data.error,
            });
        } catch {
            setConnectorStatus({ configured: false, error: "Could not query email connector." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void checkStatus();
    }, []);

    const handleSendTestEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsTesting(true);
        setTestResult(null);

        try {
            const res = await fetch("/api/admin/email-connector", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ testTo: testEmailTo.trim() || undefined }),
            });
            const data = await res.json().catch(() => ({}));

            if (res.ok && data.ok) {
                setTestResult({
                    ok: true,
                    message: `Test email successfully delivered to ${data.sentTo}! Your Gmail connector is operational.`,
                });
            } else {
                setTestResult({
                    ok: false,
                    message: data.error || "Failed to send test email.",
                });
            }
        } catch (err: unknown) {
            setTestResult({
                ok: false,
                message: err instanceof Error ? err.message : "Test email request failed.",
            });
        } finally {
            setIsTesting(false);
        }
    };

    const copyEnvSnippet = () => {
        const snippet = `GMAIL_USER=your-google-account@gmail.com\nGMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx`;
        navigator.clipboard.writeText(snippet);
        setCopiedEnv(true);
        setTimeout(() => setCopiedEnv(false), 2000);
    };

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Settings & Email Connector</h1>
                <p className="text-slate-500 text-xs mt-1">
                    Manage your connected Gmail SMTP credentials and database configurations.
                </p>
            </div>

            {/* Email Connector Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Google Account Email Connector</h2>
                            <p className="text-xs text-slate-500">
                                Delivers one-time email invite links and notification emails via Gmail SMTP
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    ) : connectorStatus?.configured ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[11px] font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Connected
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-[11px] font-semibold border border-amber-200">
                            <XCircle className="w-3 h-3" /> Needs Setup
                        </span>
                    )}
                </div>

                {connectorStatus?.configured ? (
                    <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-100 mb-5">
                        <p className="text-xs font-semibold text-emerald-900">
                            Connected Account: <strong>{connectorStatus.user || "Gmail Account"}</strong>
                        </p>
                        <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                            Your Google account password / app password is functioning properly. All invitations and responses sent from the dashboard will be delivered from this account.
                        </p>
                    </div>
                ) : (
                    <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-100 mb-5">
                        <p className="text-xs font-semibold text-amber-900">Email Connector is Not Active</p>
                        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                            {connectorStatus?.error || "GMAIL_USER and GMAIL_APP_PASSWORD environment variables are missing."} Follow the setup steps below to connect your Google account.
                        </p>
                    </div>
                )}

                {/* Send Test Email Tool */}
                <form onSubmit={handleSendTestEmail} className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-700">
                        Send a Test Invitation Email
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                            type="email"
                            value={testEmailTo}
                            onChange={(e) => setTestEmailTo(e.target.value)}
                            placeholder="Enter recipient email (e.g. your email)..."
                            className="flex-1 bg-slate-50/50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900"
                        />
                        <Button
                            type="submit"
                            disabled={isTesting}
                            className="bg-slate-900 hover:bg-black text-white h-9 px-4 text-xs font-medium shrink-0 flex items-center gap-1.5"
                        >
                            {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Test Connection</>}
                        </Button>
                    </div>

                    {testResult && (
                        <div className={`p-3 rounded-lg text-xs font-medium ${
                            testResult.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
                        }`}>
                            {testResult.message}
                        </div>
                    )}
                </form>
            </div>

            {/* Google App Password Guide */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Key className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">How to Connect Your Google Account</h2>
                        <p className="text-xs text-slate-500 font-normal">Using Google 16-character App Passwords</p>
                    </div>
                </div>

                <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                    <p>To allow CodeStarters to send one-time email invite links using your Google account without storing your primary login password, generate a secure <strong>Google App Password</strong>:</p>

                    <ol className="list-decimal pl-5 space-y-1.5">
                        <li>
                            Go to your{" "}
                            <a
                                href="https://myaccount.google.com/security"
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-600 font-semibold hover:underline inline-flex items-center gap-1"
                            >
                                Google Account Security settings <ExternalLink className="w-3 h-3" />
                            </a>.
                        </li>
                        <li>Ensure <strong>2-Step Verification</strong> is enabled.</li>
                        <li>
                            Search for <strong>"App passwords"</strong> (or go to{" "}
                            <a
                                href="https://myaccount.google.com/apppasswords"
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-600 font-semibold hover:underline inline-flex items-center gap-1"
                            >
                                myaccount.google.com/apppasswords <ExternalLink className="w-3 h-3" />
                            </a>).
                        </li>
                        <li>Enter <strong>"CodeStarters Admin"</strong> as the app name and click <strong>Create</strong>.</li>
                        <li>Copy the 16-character code (e.g., <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">abcd efgh ijkl mnop</code>).</li>
                        <li>Add these environment variables to your hosting environment or local <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">.env</code>:</li>
                    </ol>
                </div>

                <div className="bg-slate-950 rounded-lg p-3.5 text-slate-200 font-mono text-xs flex items-center justify-between border border-slate-800">
                    <div>
                        <p>GMAIL_USER="your-email@gmail.com"</p>
                        <p>GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"</p>
                    </div>
                    <button
                        onClick={copyEnvSnippet}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                        {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedEnv ? "Copied" : "Copy"}</span>
                    </button>
                </div>
            </div>

            {/* Database & System Architecture */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Database className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">Database Schema & Tables</h2>
                        <p className="text-xs text-slate-500 font-normal">Supabase PostgreSQL Architecture</p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/60">
                        <p className="font-semibold text-slate-800">admin_users</p>
                        <p className="text-slate-500 mt-0.5 text-[11px]">Authorized users, hashed passwords, roles & permissions</p>
                    </div>
                    <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/60">
                        <p className="font-semibold text-slate-800">admin_invites</p>
                        <p className="text-slate-500 mt-0.5 text-[11px]">Single-use email invite cryptographic tokens</p>
                    </div>
                    <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/60">
                        <p className="font-semibold text-slate-800">team_categories</p>
                        <p className="text-slate-500 mt-0.5 text-[11px]">Dynamic team department tabs (Robotics, Web, etc.)</p>
                    </div>
                    <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/60">
                        <p className="font-semibold text-slate-800">team_members</p>
                        <p className="text-slate-500 mt-0.5 text-[11px]">Team people, photos, roles, categories & bio</p>
                    </div>
                    <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/60">
                        <p className="font-semibold text-slate-800">website_requests</p>
                        <p className="text-slate-500 mt-0.5 text-[11px]">Client website inquiries from local businesses</p>
                    </div>
                    <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/60">
                        <p className="font-semibold text-slate-800">volunteers</p>
                        <p className="text-slate-500 mt-0.5 text-[11px]">Student mentor and volunteer applications</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
