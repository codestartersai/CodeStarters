import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/browser";
import {
    Loader2,
    Lock,
    User,
    Mail,
    Eye,
    EyeOff,
    Check,
    Copy,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

type LoginSearchParams = {
    invite?: string;
    error?: string;
};

export const Route = createFileRoute("/admin/login")({
    validateSearch: (search: Record<string, unknown>): LoginSearchParams => ({
        invite: typeof search.invite === "string" ? search.invite : undefined,
        error: typeof search.error === "string" ? search.error : undefined,
    }),
    component: AdminLoginPage,
});

function AdminLoginPage() {
    const search = useSearch({ from: "/admin/login" });
    const [mode, setMode] = useState<"signin" | "setup">("signin");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(search.error || null);

    // Initial Setup state
    const [setupName, setSetupName] = useState("codestartersai");
    const [setupEmail, setSetupEmail] = useState("codestartersai@gmail.com");
    const [setupPassword, setSetupPassword] = useState("");
    const [setupConfirm, setSetupConfirm] = useState("");

    // Invite verification state
    const [inviteToken, setInviteToken] = useState<string | null>(search.invite || null);
    const [isValidatingInvite, setIsValidatingInvite] = useState(false);
    const [inviteData, setInviteData] = useState<{
        valid: boolean;
        email?: string;
        role?: string;
        permissions?: string[];
        error?: string;
    } | null>(null);

    // Invite redemption state
    const [inviteUsername, setInviteUsername] = useState("");
    const [invitePassword, setInvitePassword] = useState("");
    const [inviteConfirm, setInviteConfirm] = useState("");
    const [savedCredentials, setSavedCredentials] = useState<{
        username: string;
        email: string;
        password: string;
    } | null>(null);
    const [copiedCreds, setCopiedCreds] = useState(false);

    // Check setup status and invite on load
    useEffect(() => {
        let isMounted = true;

        async function checkState() {
            if (search.invite) {
                const token = search.invite.trim();
                setInviteToken(token);
                setIsValidatingInvite(true);
                try {
                    const res = await fetch(`/api/admin/redeem-invite?token=${encodeURIComponent(token)}`);
                    const data = await res.json().catch(() => ({}));
                    if (isMounted) {
                        setInviteData(data);
                        if (data.valid && data.email) {
                            setInviteUsername(data.email.split("@")[0]);
                        }
                    }
                } catch {
                    if (isMounted) {
                        setInviteData({ valid: false, error: "Unable to verify this invitation link." });
                    }
                } finally {
                    if (isMounted) setIsValidatingInvite(false);
                }
            } else {
                try {
                    const res = await fetch("/api/admin/initial-setup");
                    const data = await res.json().catch(() => ({}));
                    if (isMounted && data.setupRequired) {
                        setMode("setup");
                    }
                } catch {
                    // Ignore network error on check; user can still switch modes manually
                }
            }
        }

        void checkState();
        return () => {
            isMounted = false;
        };
    }, [search.invite]);

    // Handle Standard Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const rawId = identifier.trim();
            if (!rawId || !password) {
                throw new Error("Please enter your email/username and password.");
            }

            let loginEmail = rawId;

            // Resolve email if username was provided
            if (!rawId.includes("@")) {
                const lookupRes = await fetch("/api/admin/lookup-username", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier: rawId }),
                });
                const lookupData = await lookupRes.json().catch(() => ({}));
                if (!lookupRes.ok || !lookupData.email) {
                    throw new Error(`Account "${rawId}" not found. Please verify your spelling or enter your email address.`);
                }
                loginEmail = lookupData.email;
            }

            const { error: signInErr } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password,
            });

            if (signInErr) {
                if (signInErr.message.toLowerCase().includes("invalid login credentials")) {
                    throw new Error("Invalid email or password. If you haven't set up your Super Admin password yet, click 'Setup Super Admin' below.");
                }
                throw signInErr;
            }

            // Verify admin role in admin_users table
            const verifyRes = await fetch("/api/admin/auth-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            const verifyData = await verifyRes.json().catch(() => ({}));

            if (!verifyRes.ok || !verifyData.authorized) {
                await supabase.auth.signOut();
                throw new Error(verifyData.error || "Access denied. Your account is not authorized as an administrator.");
            }

            window.location.replace("/admin");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Sign in failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Initial Super Admin Setup
    const handleInitialSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (setupPassword !== setupConfirm) {
            setError("Passwords do not match.");
            setIsSubmitting(false);
            return;
        }

        if (setupPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch("/api/admin/initial-setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: setupName.trim(),
                    email: setupEmail.trim(),
                    password: setupPassword,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok) {
                throw new Error(data.error || "Failed to configure Super Admin account.");
            }

            // Sign in immediately with newly configured credentials
            const { error: signInErr } = await supabase.auth.signInWithPassword({
                email: setupEmail.trim(),
                password: setupPassword,
            });

            if (signInErr) {
                console.warn("Auto-signin warning:", signInErr);
                setError(`Admin account configured! Automatic sign-in note: ${signInErr.message}. Please click "Switch to Sign In" and enter your credentials.`);
                setIsSubmitting(false);
                return;
            }

            window.location.replace("/admin");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to set up Super Admin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle One-Time Invite Link Redemption
    const handleRedeemInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteToken || !inviteData?.email) return;

        setIsSubmitting(true);
        setError(null);

        if (invitePassword !== inviteConfirm) {
            setError("Passwords do not match.");
            setIsSubmitting(false);
            return;
        }

        if (invitePassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch("/api/admin/redeem-invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: inviteToken,
                    name: inviteUsername.trim() || inviteData.email.split("@")[0],
                    password: invitePassword,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok) {
                throw new Error(data.error || "Failed to activate invitation.");
            }

            setSavedCredentials({
                username: inviteUsername.trim() || inviteData.email.split("@")[0],
                email: inviteData.email,
                password: invitePassword,
            });

            await supabase.auth.signInWithPassword({
                email: inviteData.email,
                password: invitePassword,
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to activate account.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyCredentials = () => {
        if (!savedCredentials) return;
        const text = `CodeStarters Admin\nUsername: ${savedCredentials.username}\nEmail: ${savedCredentials.email}\nPassword: ${savedCredentials.password}\nLogin URL: ${window.location.origin}/admin/login`;
        navigator.clipboard.writeText(text);
        setCopiedCreds(true);
        setTimeout(() => setCopiedCreds(false), 2500);
    };

    return (
        <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-zinc-800">
            {/* Minimal Brand Mark */}
            <div className="w-full max-w-[380px] mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center">
                        <span className="text-xs font-bold text-zinc-100 font-mono">CS</span>
                    </div>
                    <span className="text-sm font-semibold tracking-tight text-zinc-200">CodeStarters</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Admin</span>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-[380px] bg-[#111318] border border-zinc-800 rounded-xl p-6 sm:p-7 shadow-2xl">
                {/* 1. SAVED CREDENTIALS (SUCCESS SCREEN) */}
                {savedCredentials ? (
                    <div className="space-y-5">
                        <div className="flex items-start gap-3 p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-emerald-200">Account Activated</p>
                                <p className="text-[11px] text-emerald-400/80 mt-0.5 leading-relaxed">
                                    Your username and password are ready. Save them for future sign-ins.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2.5 bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-xs font-mono">
                            <div className="flex justify-between py-1 border-b border-zinc-800/80">
                                <span className="text-zinc-500">Username</span>
                                <span className="text-zinc-200 font-medium">{savedCredentials.username}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-zinc-800/80">
                                <span className="text-zinc-500">Email</span>
                                <span className="text-zinc-200 font-medium">{savedCredentials.email}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-zinc-500">Password</span>
                                <span className="text-zinc-200 font-medium">{savedCredentials.password}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={copyCredentials}
                            className="w-full h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {copiedCreds ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Credentials</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => window.location.replace("/admin")}
                            className="w-full h-10 bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                            <span>Enter Dashboard</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : inviteToken ? (
                    /* 2. ONE-TIME INVITE REDEMPTION */
                    isValidatingInvite ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2.5">
                            <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                            <p className="text-xs text-zinc-500">Validating invitation link...</p>
                        </div>
                    ) : inviteData?.valid ? (
                        <form onSubmit={handleRedeemInvite} className="space-y-4">
                            <div>
                                <h1 className="text-base font-semibold text-zinc-100 tracking-tight">Accept Invitation</h1>
                                <p className="text-xs text-zinc-400 mt-1">
                                    Invited as <span className="text-zinc-200 font-medium">{inviteData.role}</span> ({inviteData.email})
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-lg text-xs text-red-300">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                                    Your Username
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={inviteUsername}
                                    onChange={(e) => setInviteUsername(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 transition-colors"
                                    placeholder="e.g. codestarters"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                                    Choose Password
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={invitePassword}
                                        onChange={(e) => setInvitePassword(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg px-3 py-2 pr-9 text-xs text-zinc-100 placeholder:text-zinc-600 font-mono transition-colors"
                                        placeholder="Min 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                    >
                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                                    Confirm Password
                                </label>
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={inviteConfirm}
                                    onChange={(e) => setInviteConfirm(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 font-mono transition-colors"
                                    placeholder="Repeat password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-9 bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2"
                            >
                                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Activate & Sign In"}
                            </button>
                        </form>
                    ) : (
                        <div className="py-6 text-center space-y-3">
                            <AlertCircle className="w-6 h-6 text-zinc-500 mx-auto" />
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-200">Link Invalid or Expired</h3>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {inviteData?.error || "This invitation link has expired or has already been redeemed."}
                                </p>
                            </div>
                            <button
                                onClick={() => window.location.replace("/admin/login")}
                                className="text-xs text-zinc-400 hover:text-zinc-200 underline"
                            >
                                Return to sign in
                            </button>
                        </div>
                    )
                ) : mode === "setup" ? (
                    /* 3. SUPER ADMIN INITIAL SETUP */
                    <form onSubmit={handleInitialSetup} className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <h1 className="text-base font-semibold text-zinc-100 tracking-tight">Super Admin Setup</h1>
                                <button
                                    type="button"
                                    onClick={() => { setMode("signin"); setError(null); }}
                                    className="text-[11px] text-zinc-400 hover:text-zinc-200"
                                >
                                    Switch to Sign In
                                </button>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">
                                Configure the root administrator credentials.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-lg text-xs text-red-300">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                                Username
                            </label>
                            <input
                                required
                                type="text"
                                value={setupName}
                                onChange={(e) => setSetupName(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 transition-colors"
                                placeholder="codestartersai"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                                Super Admin Email
                            </label>
                            <input
                                required
                                type="email"
                                value={setupEmail}
                                onChange={(e) => setSetupEmail(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 transition-colors"
                                placeholder="codestartersai@gmail.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={setupPassword}
                                    onChange={(e) => setSetupPassword(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg px-3 py-2 pr-9 text-xs text-zinc-100 placeholder:text-zinc-600 font-mono transition-colors"
                                    placeholder="Min 6 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                >
                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                                Confirm Password
                            </label>
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                value={setupConfirm}
                                onChange={(e) => setSetupConfirm(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 font-mono transition-colors"
                                placeholder="Repeat password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-9 bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2"
                        >
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Super Admin & Enter"}
                        </button>
                    </form>
                ) : (
                    /* 4. STANDARD SIGN IN */
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <h1 className="text-base font-semibold text-zinc-100 tracking-tight">Sign In</h1>
                            <p className="text-xs text-zinc-400 mt-1">
                                Enter your credentials to access the admin dashboard.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-lg text-xs text-red-300 leading-relaxed">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                                Email or Username
                            </label>
                            <input
                                required
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 transition-colors"
                                placeholder="codestartersai@gmail.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg px-3 py-2 pr-9 text-xs text-zinc-100 placeholder:text-zinc-600 font-mono transition-colors"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                >
                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-9 bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2"
                        >
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Sign In"}
                        </button>

                        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                            <span>First-time setup?</span>
                            <button
                                type="button"
                                onClick={() => { setMode("setup"); setError(null); }}
                                className="text-zinc-400 hover:text-zinc-200 underline font-medium"
                            >
                                Setup Super Admin
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
