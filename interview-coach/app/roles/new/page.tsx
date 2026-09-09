"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function NewRolePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }
    router.push(`/roles/${data.role.id}`);
  }

  return (
    <div className="max-w-2xl">
      <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">
        ← Back
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">New role</h1>
      <p className="mt-1 text-sm text-slate-400">
        Describe the role and its context. The richer the description, the sharper the generated
        questions.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Role title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Head of AI at CodeStarters"
            required
            className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm outline-none focus:border-accent-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description & context <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            placeholder="Responsibilities, programs, tech stack, what success looks like, who they'll work with…"
            className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm outline-none focus:border-accent-500 resize-y"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-accent-500 hover:bg-accent-600 disabled:opacity-50 transition px-5 py-2 text-sm font-medium text-white"
          >
            {submitting ? "Creating…" : "Create role"}
          </button>
          <Link
            href="/"
            className="rounded-lg border border-ink-600 px-5 py-2 text-sm text-slate-300 hover:bg-ink-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
