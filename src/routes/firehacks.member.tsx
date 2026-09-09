import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { supabase } from "@/lib/supabase/browser";
import { getFirehacksPath } from "@/lib/firehacks/paths";
import { QrCode, LogOut, Droplets, Pizza, CupSoda, PackageOpen, X } from "lucide-react";

type Balances = Record<string, number>;

type Participant = {
  id: string;
  full_name: string;
  balances: Balances;
  limits: Record<string, number>;
};

const ITEMS = [
  {
    key: "pizza",
    label: "Pizza",
    max: 2,
    icon: Pizza,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    key: "chips",
    label: "Chips",
    max: 2,
    icon: PackageOpen,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    key: "drink",
    label: "Drink",
    max: 2,
    icon: CupSoda,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    key: "water",
    label: "Water",
    max: 3,
    icon: Droplets,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
] as const;

type ItemKey = (typeof ITEMS)[number]["key"];

export const Route = createFileRoute("/firehacks/member")({
  head: () => ({
    meta: [{ title: "Fire Hacks Food Scanner" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: MemberScannerPage,
});

export function MemberScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [balances, setBalances] = useState<Balances>({});
  const [scanError, setScanError] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState<Partial<Record<ItemKey, boolean>>>({});

  useEffect(() => {
    let controls: { stop: () => void } | null = null;
    if (!isScanning || !videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();
    codeReader
      .decodeFromVideoDevice(undefined, videoRef.current, async (result, err) => {
        if (!result) {
          if (err && err.name !== "NotFoundException") console.error(err);
          return;
        }
        const token = result.getText();
        setIsScanning(false);
        setScanError(null);

        try {
          const res = await fetch("/api/firehacks/member/lookup", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Participant not found");
          setParticipant(data);
          setBalances(data.balances);
        } catch (e: unknown) {
          setScanError(e instanceof Error ? e.message : "Failed to look up attendee");
        }
      })
      .then((c) => {
        controls = c;
      })
      .catch((e: Error) => {
        setScanError("Camera error: " + e.message);
        setIsScanning(false);
      });

    return () => {
      controls?.stop();
    };
  }, [isScanning]);

  const handleAdjust = async (key: ItemKey, delta: 1 | -1) => {
    if (!participant) return;
    setAdjusting((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch("/api/firehacks/member/redeem", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: participant.id, kind: key, delta }),
      });
      const data = await res.json();
      if (res.ok) setBalances((prev) => ({ ...prev, [key]: data.count }));
    } finally {
      setAdjusting((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleScanNext = () => {
    setParticipant(null);
    setBalances({});
    setScanError(null);
    setIsScanning(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = getFirehacksPath("/member/login");
  };

  return (
    <div
      className="fh-shell min-h-screen bg-[#0a0a0a] text-zinc-100 px-4 py-8"
      style={{ fontFamily: "var(--font-fh-body), sans-serif" }}
    >
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[0.6rem] tracking-[0.25em] text-red-500 uppercase"
              style={{ fontFamily: "var(--font-fh-heading), monospace" }}
            >
              Fire Hacks 2026
            </p>
            <h1
              className="text-xl text-zinc-50"
              style={{ fontFamily: "var(--font-fh-heading), monospace" }}
            >
              Food Scanner
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-300 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {scanError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl flex items-start gap-3 text-sm">
            <X className="w-4 h-4 shrink-0 mt-0.5" />
            {scanError}
          </div>
        )}

        {!isScanning && !participant && (
          <div className="rounded-2xl border border-zinc-800 bg-[#161616] p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-5">
              <QrCode className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-500 text-sm mb-8">
              Scan an attendee&apos;s QR code to view and update their food balance.
            </p>
            <button
              onClick={() => {
                setScanError(null);
                setIsScanning(true);
              }}
              className="px-8 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-semibold transition-colors"
              style={{ fontFamily: "var(--font-fh-heading), monospace" }}
            >
              Scan QR Code
            </button>
          </div>
        )}

        {isScanning && (
          <div className="rounded-2xl border border-zinc-800 bg-[#161616] overflow-hidden">
            <div className="aspect-square bg-black relative">
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 relative">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-red-500 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-red-500 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-red-500 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-red-500 rounded-br-xl" />
                </div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <p className="text-zinc-500 text-sm">Scanning...</p>
              <button
                onClick={() => setIsScanning(false)}
                className="text-sm text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {participant && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-[#161616] p-5 flex items-center justify-between">
              <div>
                <p
                  className="text-[0.6rem] tracking-[0.2em] text-red-500 uppercase mb-0.5"
                  style={{ fontFamily: "var(--font-fh-heading), monospace" }}
                >
                  Attendee
                </p>
                <h2
                  className="text-xl text-zinc-50"
                  style={{ fontFamily: "var(--font-fh-heading), monospace" }}
                >
                  {participant.full_name}
                </h2>
              </div>
              <button
                onClick={handleScanNext}
                className="text-sm text-zinc-500 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-600 px-3 py-2 rounded-xl transition-colors"
                style={{ fontFamily: "var(--font-fh-heading), monospace" }}
              >
                Scan Next
              </button>
            </div>

            {ITEMS.map(({ key, label, max, icon: Icon, color, bg }) => {
              const count = balances[key] ?? 0;
              const atMax = count >= max;
              const busy = adjusting[key];
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-zinc-800 bg-[#161616] p-4 flex items-center gap-4"
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 font-medium text-sm">{label}</p>
                    <div className="flex gap-1 mt-1.5">
                      {Array.from({ length: max }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${i < count ? color.replace("text-", "bg-") : "bg-zinc-800"}`}
                        />
                      ))}
                    </div>
                    <p className="text-zinc-600 text-[0.65rem] mt-1">
                      {count} / {max}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAdjust(key, -1)}
                      disabled={busy || count === 0}
                      className="w-9 h-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 font-bold text-lg flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <button
                      onClick={() => handleAdjust(key, 1)}
                      disabled={busy || atMax}
                      className={`w-9 h-9 rounded-lg font-bold text-lg flex items-center justify-center transition-colors ${atMax ? "bg-zinc-900 text-zinc-700 pointer-events-none" : "bg-red-500 hover:bg-red-400 text-white"}`}
                    >
                      {busy ? "·" : "+"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
