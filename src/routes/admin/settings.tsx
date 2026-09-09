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
        <div className="space-y-10 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings & Email Connector</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Manage your connected Google Account, SMTP credentials, and database configurations.
                </p>
            </div>

            {/* Email Connector Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Google Account Email Connector</h2>
                            <p className="text-xs text-slate-400 font-medium">
                                Delivers one-use Google SSO invitations and notification emails via Gmail SMTP
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                    ) : connectorStatus?.configured ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                            <XCircle className="w-3.5 h-3.5" /> Needs Setup
                        </span>
                    )}
                </div>

                {connectorStatus?.configured ? (
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 mb-6">
                        <p className="text-xs font-bold text-emerald-900">
                            Connected Account: <strong>{connectorStatus.user || "Gmail Account"}</strong>
                        </p>
                        <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                            Your Google account password / app password is functioning properly. All invitations sent from the dashboard will be delivered from this account.
                        </p>
                    </div>
                ) : (
                    <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 mb-6">
                        <p className="text-xs font-bold text-amber-900">Email Connector is Not Yet Active</p>
                        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                            {connectorStatus?.error || "GMAIL_USER and GMAIL_APP_PASSWORD environment variables are missing."} Follow the setup steps below to connect your Google account.
                        </p>
                    </div>
                )}

                {/* Send Test Email Tool */}
                <form onSubmit={handleSendTestEmail} className="pt-4 border-t border-slate-100 space-y-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Send a Test Invitation Email
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            value={testEmailTo}
                            onChange={(e) => setTestEmailTo(e.target.value)}
                            placeholder="Enter recipient email (e.g. your email)..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                        />
                        <Button
                            type="submit"
                            disabled={isTesting}
                            className="bg-slate-900 hover:bg-black text-white h-11 px-5 text-xs font-bold shrink-0 flex items-center gap-2"
                        >
                            {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Test Connection</>}
                        </Button>
                    </div>

                    {testResult && (
                        <div className={`p-4 rounded-2xl text-xs font-bold ${
                            testResult.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
                        }`}>
                            {testResult.message}
                        </div>
                    )}
                </form>
            </div>

            {/* Google App Password Guide */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Key className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900">How to Connect Your Google Account</h2>
                        <p className="text-xs text-slate-400 font-medium">Using Google 16-character App Passwords</p>
                    </div>
                </div>

                <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                    <p>To allow CodeStarters to send one-use SSO invitations using your Google account without storing your primary login password, generate a secure <strong>Google App Password</strong>:</p>

                    <ol className="list-decimal pl-5 space-y-2">
                        <li>
                            Go to your{" "}
                            <a
                                href="https://myaccount.google.com/security"
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-600 font-bold hover:underline inline-flex items-center gap-1"
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
                                className="text-brand-600 font-bold hover:underline inline-flex items-center gap-1"
                            >
                                myaccount.google.com/apppasswords <ExternalLink className="w-3 h-3" />
                            </a>).
                        </li>
                        <li>Enter <strong>"CodeStarters Admin"</strong> as the app name and click <strong>Create</strong>.</li>
                        <li>Copy the 16-character code (e.g., <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">abcd efgh ijkl mnop</code>).</li>
                        <li>Add these environment variables to your hosting environment or local <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">.env</code>:</li>
                    </ol>
                </div>

                <div className="bg-slate-900 rounded-2xl p-4 text-slate-200 font-mono text-xs flex items-center justify-between">
                    <div>
                        <p>GMAIL_USER="your-email@gmail.com"</p>
                        <p>GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"</p>
                    </div>
                    <button
                        onClick={copyEnvSnippet}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                        {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedEnv ? "Copied" : "Copy"}</span>
                    </button>
                </div>
            </div>

            {/* Database & System Architecture */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Database className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900">Database Schema & Tables</h2>
                        <p className="text-xs text-slate-400 font-medium">Supabase PostgreSQL Architecture</p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800">admin_users</p>
                        <p className="text-slate-500 mt-0.5">Authorized users, roles & permissions</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800">admin_invites</p>
                        <p className="text-slate-500 mt-0.5">One-use Google SSO cryptographic tokens</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800">team_categories</p>
                        <p className="text-slate-500 mt-0.5">Dynamic team department tabs (Robotics, Web, etc.)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800">team_members</p>
                        <p className="text-slate-500 mt-0.5">Team people, photos, roles & bio</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800">website_requests</p>
                        <p className="text-slate-500 mt-0.5">Client website inquiries from Cupertino businesses</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800">volunteers</p>
                        <p className="text-slate-500 mt-0.5">Student mentor and volunteer applications</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
