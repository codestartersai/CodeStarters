import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/browser";
import { Button } from "@/components/codestarters/Button";
import {
    Loader2,
    Mail,
    Lock,
    User,
    ShieldCheck,
    Sparkles,
    AlertCircle,
    Copy,
    Check,
    KeyRound,
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    ShieldAlert,
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
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(search.error || null);

    // Initial Setup state (when 0 admins exist)
    const [isCheckingSetup, setIsCheckingSetup] = useState(true);
    const [setupRequired, setSetupRequired] = useState(false);
    const [setupUsername, setSetupUsername] = useState("");
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

    // Invite redemption form state
    const [inviteUsername, setInviteUsername] = useState("");
    const [invitePassword, setInvitePassword] = useState("");
    const [inviteConfirm, setInviteConfirm] = useState("");
    const [savedCredentials, setSavedCredentials] = useState<{
        username: string;
        email: string;
        password: string;
    } | null>(null);
    const [copiedCreds, setCopiedCreds] = useState(false);

    // 1. Check if initial bootstrap is needed OR validate invite token
    useEffect(() => {
        let isMounted = true;

        async function init() {
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
                // Check if system needs first-user setup
                try {
                    const res = await fetch("/api/admin/initial-setup");
                    const data = await res.json().catch(() => ({}));
                    if (isMounted && data.setupRequired) {
                        setSetupRequired(true);
                    }
                } catch (err) {
                    console.warn("Failed to check setup status:", err);
                } finally {
                    if (isMounted) setIsCheckingSetup(false);
                }
            }
        }

        void init();
        return () => {
            isMounted = false;
        };
    }, [search.invite]);

    // Handle Standard Login (Username or Email + Password)
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

            // If identifier does not contain '@', resolve email via username lookup
            if (!rawId.includes("@")) {
                const lookupRes = await fetch("/api/admin/lookup-username", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier: rawId }),
                });
                const lookupData = await lookupRes.json().catch(() => ({}));
                if (!lookupRes.ok || !lookupData.email) {
                    throw new Error(`No account found with username "${rawId}". Please check your spelling or sign in with your email.`);
                }
                loginEmail = lookupData.email;
            }

            // Authenticate with Supabase
            const { error: signInErr } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password,
            });

            if (signInErr) {
                throw new Error(signInErr.message === "Invalid login credentials"
                    ? "Invalid credentials. Please verify your email/username and password."
                    : signInErr.message);
            }

            // Strict authorization check: ensure user exists in admin_users table
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

            // Successfully authenticated as an authorized admin
            window.location.href = "/admin";
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Authentication failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle First-User Super Admin Setup
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
                    username: setupUsername.trim(),
                    email: setupEmail.trim(),
                    password: setupPassword,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok) {
                throw new Error(data.error || "Failed to initialize super admin.");
            }

            // Log in immediately
            const { error: signInErr } = await supabase.auth.signInWithPassword({
                email: setupEmail.trim(),
                password: setupPassword,
            });

            if (signInErr) {
                console.warn("Auto-signin error:", signInErr);
            }

            window.location.href = "/admin";
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to set up Super Admin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle One-Time Invite Redemption (Set username & password)
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

            // Store credentials to show copy screen
            setSavedCredentials({
                username: inviteUsername.trim() || inviteData.email.split("@")[0],
                email: inviteData.email,
                password: invitePassword,
            });

            // Automatically sign in
            const { error: signInErr } = await supabase.auth.signInWithPassword({
                email: inviteData.email,
                password: invitePassword,
            });

            if (signInErr) {
                console.warn("Auto sign-in warning:", signInErr);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error setting up account.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyCredentials = () => {
        if (!savedCredentials) return;
        const text = `CodeStarters Admin Credentials\nUsername: ${savedCredentials.username}\nEmail: ${savedCredentials.email}\nPassword: ${savedCredentials.password}\nLogin URL: ${window.location.origin}/admin/login`;
        navigator.clipboard.writeText(text);
        setCopiedCreds(true);
        setTimeout(() => setCopiedCreds(false), 2500);
    };

    const generateStrongPassword = (target: "invite" | "setup") => {
        const rand = Math.random().toString(36).slice(-8) + "!CS" + Math.floor(100 + Math.random() * 900);
        if (target === "invite") {
            setInvitePassword(rand);
            setInviteConfirm(rand);
        } else {
            setSetupPassword(rand);
            setSetupConfirm(rand);
        }
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

                {/* VIEW 1: ONE-TIME LINK ACTIVATED - CREDENTIALS CREATED CONFIRMATION */}
                {savedCredentials ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-emerald-900">Account Activated!</p>
                                <p className="text-xs text-emerald-700 leading-relaxed mt-0.5">
                                    Your username and password have been saved. You can now use them anytime to sign in.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username</p>
                                <p className="text-sm font-bold text-slate-900 font-mono">{savedCredentials.username}</p>
                            </div>
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
                ) : inviteToken ? (
                    /* VIEW 2: ONE-TIME INVITE LINK REDEMPTION FORM */
                    isValidatingInvite ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                            <p className="text-xs font-medium text-slate-500">Verifying your invitation link...</p>
                        </div>
                    ) : inviteData?.valid ? (
                        <form onSubmit={handleRedeemInvite} className="space-y-4">
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-emerald-900">You've Been Invited!</p>
                                    <p className="text-xs text-emerald-700 leading-relaxed mt-0.5">
                                        Assigned Role: <strong>{inviteData.role}</strong> ({inviteData.email})
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    Choose Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        type="text"
                                        value={inviteUsername}
                                        onChange={(e) => setInviteUsername(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                        placeholder="e.g. jdoe or Jane Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Create Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => generateStrongPassword("invite")}
                                        className="text-[11px] font-bold text-brand-600 hover:underline"
                                    >
                                        Suggest Password
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={invitePassword}
                                        onChange={(e) => setInvitePassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 py-2.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                        placeholder="At least 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={inviteConfirm}
                                        onChange={(e) => setInviteConfirm(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                        placeholder="Confirm your password"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-13 text-sm font-bold bg-slate-900 hover:bg-black shadow-md shadow-slate-200 flex items-center justify-center gap-2 mt-4"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Create Account & Join Dashboard</span>
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center py-6 space-y-4">
                            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Invalid or Expired Invitation</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    {inviteData?.error || "This invitation link has either already been used or has expired."}
                                </p>
                            </div>
                            <Button
                                onClick={() => (window.location.href = "/admin/login")}
                                variant="outline"
                                className="text-xs font-bold"
                            >
                                Back to Sign In
                            </Button>
                        </div>
                    )
                ) : setupRequired ? (
                    /* VIEW 3: INITIAL SETUP - CREATE SUPER ADMIN ACCOUNT */
                    <form onSubmit={handleInitialSetup} className="space-y-4">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-amber-900">Initial Setup Required</p>
                                <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
                                    Create the initial <strong>Super Admin</strong> account. Afterwards, self-registration is permanently locked.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Full Name / Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    required
                                    type="text"
                                    value={setupUsername}
                                    onChange={(e) => setSetupUsername(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    placeholder="e.g. CodeStarters Admin"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Super Admin Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    required
                                    type="email"
                                    value={setupEmail}
                                    onChange={(e) => setSetupEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    placeholder="codestartersai@gmail.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => generateStrongPassword("setup")}
                                    className="text-[11px] font-bold text-brand-600 hover:underline"
                                >
                                    Suggest Password
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={setupPassword}
                                    onChange={(e) => setSetupPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 py-2.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    placeholder="At least 6 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={setupConfirm}
                                    onChange={(e) => setSetupConfirm(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                                    placeholder="Repeat your password"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-13 text-sm font-bold bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-200 flex items-center justify-center gap-2 mt-4"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Create Super Admin & Lock Portal</span>
                                </>
                            )}
                        </Button>
                    </form>
                ) : (
                    /* VIEW 4: STANDARD ADMIN LOGIN */
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Username or Email
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    required
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-900 transition-all"
                                    placeholder="Username or email address"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-900 transition-all"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-13 text-sm font-bold bg-slate-900 hover:bg-black shadow-lg shadow-slate-200 flex items-center justify-center gap-2 mt-4"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    <span>Sign In to Dashboard</span>
                                </>
                            )}
                        </Button>

                        <p className="text-center text-[11px] text-slate-400 leading-relaxed pt-2">
                            Dashboard access is restricted to verified administrators. Invitations are delivered via email.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
