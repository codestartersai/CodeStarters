import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase/browser";
import { getFirehacksPath } from "@/lib/firehacks/paths";
import { Loader2, Lock, Mail, Flame } from "lucide-react";

export const Route = createFileRoute("/firehacks/member/login")({
  head: () => ({
    meta: [
      { title: "Fire Hacks Scanner — Sign In" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MemberLoginPage,
});

export function MemberLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      window.location.href = getFirehacksPath("/member");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fh-shell min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center px-6 py-16"
      style={{ fontFamily: "var(--font-fh-body), sans-serif" }}
    >
      <div className="w-full max-w-md rounded-2xl border border-red-500/15 bg-[#161616] p-8 md:p-10 shadow-[0_0_60px_rgba(239,68,68,0.08)]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <Flame className="w-7 h-7 text-red-500" />
          </div>
          <p
            className="text-[0.7rem] tracking-[0.25em] text-red-500 uppercase mb-2"
            style={{ fontFamily: "var(--font-fh-heading), monospace" }}
          >
            Staff Access
          </p>
          <h1
            className="text-2xl md:text-3xl text-zinc-50"
            style={{ fontFamily: "var(--font-fh-heading), monospace" }}
          >
            Fire Hacks Scanner
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label
              className="text-xs font-bold text-zinc-300 uppercase tracking-wider"
              style={{ fontFamily: "var(--font-fh-heading), monospace" }}
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all text-zinc-100 placeholder:text-zinc-600"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs font-bold text-zinc-300 uppercase tracking-wider"
              style={{ fontFamily: "var(--font-fh-heading), monospace" }}
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all text-zinc-100 placeholder:text-zinc-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 text-red-300 text-sm rounded-xl border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold transition-colors disabled:opacity-60 disabled:pointer-events-none inline-flex items-center justify-center"
            style={{ fontFamily: "var(--font-fh-heading), monospace" }}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
