import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browser";
import { getFirehacksPath } from "@/lib/firehacks/paths";
import { Flame, LogOut, Loader2, AlertTriangle } from "lucide-react";
import { QrPanel } from "@/components/firehacks/QrPanel";
import { WaiverPanel } from "@/components/firehacks/WaiverPanel";
import { RedemptionsPanel, type Redemption } from "@/components/firehacks/RedemptionsPanel";

type Participant = {
  id: string;
  full_name: string;
  email: string;
  event_id: string;
  pass_token: string;
  waiver_storage_path: string | null;
  waiver_uploaded_at: string | null;
};

export const Route = createFileRoute("/firehacks/portal/")({
  head: () => ({
    meta: [
      { title: "Fire Hacks Portal" },
      { name: "description", content: "Participant portal for Fire Hacks 2026." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FireHacksPortalPage,
});

export function FireHacksPortalPage() {
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = getFirehacksPath("/portal/login");
          return;
        }
        if (cancelled) return;
        setUserEmail(user.email ?? null);

        const { data, error } = await supabase
          .from("firehacks_participants")
          .select(
            "id, full_name, email, event_id, pass_token, waiver_storage_path, waiver_uploaded_at",
          )
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (cancelled) return;
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        setParticipant(data);

        if (data) {
          const { data: rData, error: rError } = await supabase
            .from("firehacks_meal_redemptions")
            .select("id, kind, redeemed_at")
            .eq("participant_id", data.id)
            .order("redeemed_at", { ascending: false });
          if (cancelled) return;
          if (!rError && rData) setRedemptions(rData as Redemption[]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = getFirehacksPath("/portal/login");
  };

  const handleWaiverUploaded = (uploadedAt: string) => {
    setParticipant((p) => (p ? { ...p, waiver_uploaded_at: uploadedAt } : p));
  };

  return (
    <div
      className="fh-shell min-h-screen bg-[#0a0a0a] text-zinc-100 px-6 py-10 md:py-16"
      style={{ fontFamily: "var(--font-fh-body), sans-serif" }}
    >
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p
                className="text-[0.65rem] tracking-[0.25em] text-red-500 uppercase"
                style={{ fontFamily: "var(--font-fh-heading), monospace" }}
              >
                Fire Hacks Portal
              </p>
              <p className="text-zinc-300 text-sm">{userEmail ?? "—"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 text-sm transition-colors disabled:opacity-60 disabled:pointer-events-none"
          >
            {signingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Sign out
          </button>
        </header>

        {loading && (
          <div className="flex items-center gap-3 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading your participant info…
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 flex items-start gap-3 text-sm text-red-300">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="text-red-200/80 mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {!loading && !errorMessage && !participant && (
          <div className="rounded-2xl border border-zinc-800 bg-[#161616] p-8">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <h2
              className="text-xl text-zinc-100 mb-2"
              style={{ fontFamily: "var(--font-fh-heading), monospace" }}
            >
              No participant record linked
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              You&apos;re signed in as <span className="text-zinc-200">{userEmail}</span>, but we
              couldn&apos;t find a Fire Hacks participant registration tied to that email. If you
              registered with a different email, sign out and sign in again with that one.
              Otherwise, contact event staff and we&apos;ll get you sorted.
            </p>
          </div>
        )}

        {!loading && !errorMessage && participant && (
          <div className="space-y-5">
            <div>
              <p
                className="text-[0.65rem] tracking-[0.25em] text-red-500 uppercase mb-2"
                style={{ fontFamily: "var(--font-fh-heading), monospace" }}
              >
                Welcome
              </p>
              <h2
                className="text-2xl md:text-3xl text-zinc-50"
                style={{ fontFamily: "var(--font-fh-heading), monospace" }}
              >
                {participant.full_name}
              </h2>
              <p className="text-zinc-500 text-sm mt-2">
                Registered for <span className="text-zinc-300">{participant.event_id}</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <QrPanel passToken={participant.pass_token} fullName={participant.full_name} />
              <WaiverPanel
                initialUploadedAt={participant.waiver_uploaded_at}
                onUploaded={handleWaiverUploaded}
              />
            </div>

            <RedemptionsPanel redemptions={redemptions} />
          </div>
        )}
      </div>
    </div>
  );
}
