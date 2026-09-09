import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase/browser";
import { Button } from "@/components/codestarters/Button";
import { Loader2, Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
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

      const sessionCheck = await fetch("/api/admin/session", { credentials: "include" });
      if (!sessionCheck.ok) {
        await supabase.auth.signOut();
        throw new Error("You are not authorized to access the admin dashboard.");
      }

      window.location.href = "/admin";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-brand-50 mx-auto mb-6 flex items-center justify-center">
            <span className="text-brand-700 font-black text-2xl">CS</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Portal</h1>
          <p className="text-slate-500">Sign in to manage CodeStarters</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-900"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 italic">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full h-14 text-xl shadow-lg shadow-brand-200"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In"}
          </Button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-xs uppercase tracking-widest font-bold">
          Founders Access Only
        </p>
      </div>
    </div>
  );
}
