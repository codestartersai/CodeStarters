import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/browser";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/codestarters/Button";

export const Route = createFileRoute("/admin/auth/callback")({
    component: AdminAuthCallback,
});

function AdminAuthCallback() {
    const navigate = useNavigate();
    const [statusText, setStatusText] = useState("Verifying Google SSO session...");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function verify() {
            try {
                const supabase = getSupabase();

                // 1. Check for session (Supabase client automatically picks up the OAuth hash/code)
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (!session?.user) {
                    // Wait briefly for client token exchange if needed
                    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, freshSession) => {
                        if (freshSession?.user && isMounted) {
                            authListener.subscription.unsubscribe();
                            await processVerification(freshSession.user.email);
                        }
                    });
                    return;
                }

                await processVerification(session.user.email);
            } catch (err: unknown) {
                if (!isMounted) return;
                const msg = err instanceof Error ? err.message : "Authentication failed.";
                setErrorMessage(msg);
            }
        }

        async function processVerification(email?: string | null) {
            if (!isMounted) return;
            setStatusText("Checking admin permissions & invitations...");

            // Check if there was an invite token stored in sessionStorage
            const inviteToken = typeof window !== "undefined"
                ? window.sessionStorage.getItem("cs_invite_token") || undefined
                : undefined;

            const res = await fetch("/api/admin/auth-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inviteToken }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data.authorized) {
                // Clear the session since user is not authorized
                const supabase = getSupabase();
                await supabase.auth.signOut();
                if (typeof window !== "undefined") {
                    window.sessionStorage.removeItem("cs_invite_token");
                }
                const err = data.error || `Access denied for ${email || "this account"}. You have not been invited to the admin portal.`;
                setErrorMessage(err);
                return;
            }

            // Success! Clear invite token and redirect to dashboard
            if (typeof window !== "undefined") {
                window.sessionStorage.removeItem("cs_invite_token");
            }
            navigate({ to: "/admin" });
        }

        void verify();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    if (errorMessage) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Access Restricted</h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-8">{errorMessage}</p>
                    <Button
                        onClick={() => navigate({ to: "/admin/login" })}
                        className="w-full h-12 text-sm flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-xl p-10 text-center border border-slate-100">
                <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-6" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Connecting Account</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{statusText}</p>
            </div>
        </div>
    );
}
