"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import QuestionList from "@/components/QuestionList";
import type { Question, Role } from "@/lib/types";

export default function RoleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roleId = params.id;

  const [role, setRole] = useState<Role | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [intervieweeName, setIntervieweeName] = useState("");
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/roles/${roleId}`);
    const data = await res.json();
    if (res.ok) {
      setRole(data.role);
      setQuestions(data.questions ?? []);
    }
    setLoading(false);
  }, [roleId]);

  useEffect(() => {
    load();
  }, [load]);

  async function generate() {
    setGenerating(true);
    setError(null);
    const res = await fetch(`/api/roles/${roleId}/generate-questions`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Generation failed.");
    else setQuestions(data.questions ?? []);
    setGenerating(false);
  }

  async function startInterview() {
    setStarting(true);
    setError(null);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId: Number(roleId), intervieweeName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not start interview.");
      setStarting(false);
      return;
    }
    router.push(`/interview/${data.session.id}`);
  }

  if (loading) return <p className="text-slate-500 text-sm">Loading…</p>;
  if (!role) return <p className="text-slate-400 text-sm">Role not found.</p>;

  const hasQuestions = questions.length > 0;

  return (
    <div className="space-y-10">
      <div>
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Back
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{role.title}</h1>
        {role.description && (
          <p className="mt-2 max-w-3xl text-sm text-slate-400 whitespace-pre-wrap">
            {role.description}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Start interview */}
      <section className="rounded-xl border border-accent-500/30 bg-accent-500/5 p-5">
        <h2 className="font-medium">Start in-person interview</h2>
        <p className="mt-1 text-sm text-slate-400">
          {hasQuestions
            ? "Enter their name and begin the interview."
            : "Generate questions first, then you can start."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            value={intervieweeName}
            onChange={(e) => setIntervieweeName(e.target.value)}
            placeholder="Interviewee name"
            className="flex-1 min-w-[200px] rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm outline-none focus:border-accent-500"
          />
          <button
            onClick={startInterview}
            disabled={!hasQuestions || starting}
            className="rounded-lg bg-accent-500 hover:bg-accent-600 disabled:opacity-40 transition px-5 py-2 text-sm font-medium text-white"
          >
            {starting ? "Starting…" : "Start Interview →"}
          </button>
        </div>
      </section>

      {/* Questions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">
            Questions {hasQuestions && <span className="text-slate-500">({questions.length})</span>}
          </h2>
          <button
            onClick={generate}
            disabled={generating}
            className="rounded-lg border border-ink-600 hover:bg-ink-800 disabled:opacity-50 transition px-4 py-1.5 text-sm"
          >
            {generating
              ? "Generating…"
              : hasQuestions
                ? "Regenerate"
                : "Generate questions"}
          </button>
        </div>

        {hasQuestions ? (
          <QuestionList questions={questions} />
        ) : (
          <div className="rounded-xl border border-dashed border-ink-600 p-10 text-center text-sm text-slate-400">
            {generating
              ? "Generating questions with AI…"
              : "No questions yet. Click “Generate questions” to build the interview kit."}
          </div>
        )}
      </section>
    </div>
  );
}
