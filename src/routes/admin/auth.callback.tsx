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
            <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-6 text-slate-100">
                <div className="w-full max-w-sm bg-[#11131a] rounded-xl shadow-2xl p-7 border border-slate-800 text-center">
                    <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-semibold text-white mb-2">Access Restricted</h2>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">{errorMessage}</p>
                    <Button
                        onClick={() => navigate({ to: "/admin/login" })}
                        className="w-full h-9 text-xs font-medium bg-white hover:bg-slate-100 text-slate-900 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-6 text-slate-100">
            <div className="w-full max-w-xs bg-[#11131a] rounded-xl shadow-2xl p-8 text-center border border-slate-800">
                <div className="w-8 h-8 border-2 border-slate-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-white mb-1">Verifying Access</h3>
                <p className="text-xs text-slate-400">{statusText}</p>
            </div>
        </div>
    );
}
