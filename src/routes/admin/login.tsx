import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase, signInWithGoogle } from "@/lib/supabase/browser";
import { Button } from "@/components/codestarters/Button";
import {
    Loader2,
    Mail,
    Lock,
    ShieldCheck,
    Sparkles,
    AlertCircle,
    Copy,
    Check,
    KeyRound,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/admin/login")({
    validateSearch: (search: Record<string, unknown>) => ({
        invite: typeof search.invite === "string" ? search.invite : undefined,
        error: typeof search.error === "string" ? search.error : undefined,
    }),
    component: AdminLoginPage,
});

function AdminLoginPage() {
    const search = useSearch({ from: "/admin/login" });
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(search.error || null);
    const [inviteToken, setInviteToken] = useState<string | null>(search.invite || null);

    // Invite verification state
    const [isValidatingInvite, setIsValidatingInvite] = useState(false);
    const [inviteData, setInviteData] = useState<{
        valid: boolean;
        email?: string;
        role?: string;
        permissions?: string[];
        error?: string;
    } | null>(null);

    // Credential Generation State
    const [newPassword, setNewPassword] = useState("");
    const [savedCredentials, setSavedCredentials] = useState<{
        email: string;
        password: string;
    } | null>(null);
    const [copiedCreds, setCopiedCreds] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    // Validate invite token if present in URL
    useEffect(() => {
        if (search.invite) {
            const token = search.invite.trim();
            setInviteToken(token);
            try {
                window.sessionStorage.setItem("cs_invite_token", token);
            } catch {}

            setIsValidatingInvite(true);
            fetch(`/api/admin/redeem-invite?token=${token}`)
                .then((res) => res.json())
                .then((data) => {
                    setInviteData(data);
                    if (data.email) {
                        setEmail(data.email);
                        // Generate a strong random password suggestion
                        const randomPass = Math.random().toString(36).slice(-8) + "!CS" + Math.floor(100 + Math.random() * 900);
                        setNewPassword(randomPass);
                    }
                })
                .catch(() => {
                    setInviteData({ valid: false, error: "Failed to verify invitation link." });
                })
                .finally(() => setIsValidatingInvite(false));
        }
    }, [search.invite]);

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to initialize Google SSO.");
            setIsGoogleLoading(false);
        }
    };

    const handleClaimWithPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteToken || !inviteData?.email) return;
        setIsClaiming(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/redeem-invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: inviteToken,
                    password: newPassword,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok) {
                throw new Error(data.error || "Failed to redeem invitation.");
            }

            // Save credentials to display to user
            setSavedCredentials({
                email: inviteData.email,
                password: newPassword,
            });

            // Sign in immediately with the new credentials
            const { error: signInErr } = await supabase.auth.signInWithPassword({
                email: inviteData.email,
                password: newPassword,
            });

            if (signInErr) {
                console.warn("Auto-signin warning:", signInErr);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error saving credentials.");
        } finally {
            setIsClaiming(false);
        }
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPasswordLoading(true);
        setError(null);

        try {
            const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
            if (loginError) throw loginError;

            // Verify admin access
            const res = await fetch("/api/admin/auth-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inviteToken: inviteToken || undefined }),
            });
            const authRes = await res.json().catch(() => ({}));

            if (!res.ok || !authRes.authorized) {
                await supabase.auth.signOut();
                throw new Error(authRes.error || "You are not authorized to access the admin dashboard.");
            }

            window.location.href = "/admin";
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Sign in failed.");
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const copyCredentials = () => {
        if (!savedCredentials) return;
        const text = `CodeStarters Admin Credentials\nEmail: ${savedCredentials.email}\nPassword: ${savedCredentials.password}\nLogin URL: ${window.location.origin}/admin/login`;
        navigator.clipboard.writeText(text);
        setCopiedCreds(true);
        setTimeout(() => setCopiedCreds(false), 2500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background ambient accents */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-white rounded-[2.75rem] shadow-2xl p-8 sm:p-12 relative z-10 border border-slate-100">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-brand-50 mx-auto mb-5 flex items-center justify-center shadow-inner">
                        <span className="text-brand-700 font-black text-2xl tracking-tighter">CS</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">CodeStarters</h1>
                    <p className="text-slate-500 text-sm font-medium">Administrator & Leadership Portal</p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-red-900">Authentication Alert</p>
                            <p className="text-xs text-red-700 leading-relaxed mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {/* 1. SAVED CREDENTIALS SUCCESS VIEW */}
                {savedCredentials ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-emerald-900">Access Granted!</p>
                                <p className="text-xs text-emerald-700 leading-relaxed mt-0.5">
                                    Your admin credentials have been created. Save them to your password manager.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                                <p className="text-sm font-bold text-slate-900 font-mono">{savedCredentials.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</p>
                                <p className="text-sm font-bold text-slate-900 font-mono bg-white p-2 rounded-lg border border-slate-200">
                                    {savedCredentials.password}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={copyCredentials}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                            >
                                {copiedCreds ? (
                                    <>
                                        <Check className="w-4 h-4 text-emerald-400" />
                                        <span>Copied to Clipboard!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        <span>Copy Credentials</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <Button
                            onClick={() => (window.location.href = "/admin")}
                            className="w-full h-14 text-base font-bold shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
                        >
                            <span>Enter Admin Dashboard</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                ) : inviteToken && inviteData?.valid ? (
                    /* 2. INVITE REDEMPTION & CREDENTIAL CREATION VIEW */
                    <div className="space-y-6">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-emerald-900">You've Been Invited!</p>
                                <p className="text-xs text-emerald-700 leading-relaxed mt-0.5">
                                    Assigned Role: <strong>{inviteData.role}</strong> ({inviteData.email})
                                </p>
                            </div>
                        </div>

                        {/* Option 1: 1-Click Google SSO */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                            className="w-full h-13 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border-2 border-slate-200 hover:border-slate-300 shadow-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            {isGoogleLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.41 7.34 24 12 24z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.43l4.03-3.14z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.59 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
                                        />
                                    </svg>
                                    <span className="text-xs sm:text-sm">Claim Access via Google SSO</span>
                                </>
                            )}
                        </button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                                    or Save Password Credentials
                                </span>
                            </div>
                        </div>

                        {/* Option 2: Set and Save Credentials */}
                        <form onSubmit={handleClaimWithPassword} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    Your Email
                                </label>
                                <input
                                    readOnly
                                    value={inviteData.email}
                                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Create Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const gen = Math.random().toString(36).slice(-8) + "!CS" + Math.floor(100 + Math.random() * 900);
                                            setNewPassword(gen);
                                        }}
                                        className="text-[11px] font-bold text-brand-600 hover:underline"
                                    >
                                        Generate Strong Password
                                    </button>
                                </div>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        type="text"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                        placeholder="Enter password..."
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isClaiming}
                                className="w-full h-12 text-sm font-bold bg-slate-900 hover:bg-black shadow-md shadow-slate-200 flex items-center justify-center gap-2"
                            >
                                {isClaiming ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        <span>Create & Save Credentials</span>
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                ) : (
                    /* 3. STANDARD LOGIN VIEW */
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                            className="w-full h-14 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border-2 border-slate-200 hover:border-slate-300 shadow-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                        >
                            {isGoogleLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.41 7.34 24 12 24z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.43l4.03-3.14z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.59 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
                                        />
                                    </svg>
                                    <span>Sign in with Google SSO</span>
                                </>
                            )}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                                    Secure Access
                                </span>
                            </div>
                        </div>

                        {!showPasswordForm ? (
                            <button
                                type="button"
                                onClick={() => setShowPasswordForm(true)}
                                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest py-2"
                            >
                                Sign in with Saved Password &rarr;
                            </button>
                        ) : (
                            <form onSubmit={handlePasswordLogin} className="space-y-4 pt-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900"
                                            placeholder="admin@codestarters.org"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isPasswordLoading}
                                    className="w-full h-12 text-base font-bold shadow-lg shadow-brand-100"
                                >
                                    {isPasswordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                                </Button>
                            </form>
                        )}
                    </div>
                )}

                {/* Footer security guarantee */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Invite-only administrative security</span>
                </div>
            </div>
        </div>
    );
}
