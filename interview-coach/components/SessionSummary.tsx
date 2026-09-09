"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  answeredAnswers,
  averageAnsweredScore,
  hireBand,
  isAnswered,
} from "@/lib/scoring";
import type { Answer, QuestionWithRole, Role, Session } from "@/lib/types";

function scoreColor(score: number): string {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-emerald-600/80";
  if (score >= 55) return "bg-amber-500";
  if (score >= 35) return "bg-orange-500";
  return "bg-red-500";
}

function safeParse(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function questionStatus(answer: Answer | undefined): "answered" | "skipped" {
  if (answer && isAnswered(answer)) return "answered";
  return "skipped";
}

export default function SessionSummary({
  session,
  roles,
  questions,
  answers,
}: {
  session: Session;
  roles: Role[];
  questions: QuestionWithRole[];
  answers: Answer[];
}) {
  const [copied, setCopied] = useState(false);

  const roleTitles = roles.map((r) => r.title).join(" + ");

  const answerByQ = useMemo(() => {
    const m = new Map<number, Answer>();
    for (const a of answers) m.set(a.question_id, a);
    return m;
  }, [answers]);

  const answered = useMemo(() => answeredAnswers(answers), [answers]);
  const answeredCount = answered.length;
  const displayScore =
    averageAnsweredScore(answers) != null
      ? Math.round(averageAnsweredScore(answers)!)
      : null;
  const rec = hireBand(displayScore);

  function buildExport(): string {
    const lines: string[] = [];
    lines.push(`Interview Summary — ${roleTitles}`);
    lines.push(`Interviewee: ${session.interviewee_name || "Unnamed"}`);
    lines.push(`Date: ${session.started_at}`);
    lines.push(
      `Overall: ${displayScore != null ? displayScore + " / 100" : "n/a"} — ${rec.label} (${answeredCount}/${questions.length} answered)`
    );
    lines.push("");
    questions.forEach((q, i) => {
      const a = answerByQ.get(q.id);
      const status = questionStatus(a);
      lines.push(`${i + 1}. [${q.role_title}] [${q.category}] ${q.question}`);
      lines.push(
        `   ${status === "skipped" ? "Skipped" : `Score: ${a?.score ?? "—"}/100`}`
      );
      if (a?.feedback) lines.push(`   Feedback: ${a.feedback}`);
      const strengths = a ? safeParse(a.strengths) : [];
      const gaps = a ? safeParse(a.gaps) : [];
      if (strengths.length) lines.push(`   Strengths: ${strengths.join("; ")}`);
      if (gaps.length) lines.push(`   Gaps: ${gaps.join("; ")}`);
      if (a?.interviewer_note) lines.push(`   Note: ${a.interviewer_note}`);
      lines.push("");
    });
    return lines.join("\n");
  }

  async function copyAll() {
    await navigator.clipboard.writeText(buildExport());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">
            ← Back
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            {session.interviewee_name || "Interviewee"}
          </h1>
          <p className="text-sm text-slate-400">
            {roleTitles} · {session.started_at}
          </p>
        </div>
        <button
          onClick={copyAll}
          className="rounded-lg border border-ink-600 hover:bg-ink-800 px-4 py-2 text-sm"
        >
          {copied ? "Copied!" : "Copy notes"}
        </button>
      </div>

      <div className="rounded-xl border border-ink-700 bg-ink-900/50 p-6 flex flex-wrap items-center gap-8">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Average score</p>
          <p className="text-4xl font-bold">
            {displayScore != null ? displayScore : "—"}
            <span className="text-lg text-slate-500"> / 100</span>
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Recommendation</p>
          <p className={`text-xl font-semibold ${rec.color}`}>{rec.label}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Answered</p>
          <p className="text-xl">
            {answeredCount} of {questions.length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const a = answerByQ.get(q.id);
          const status = questionStatus(a);
          const strengths = a ? safeParse(a.strengths) : [];
          const gaps = a ? safeParse(a.gaps) : [];
          return (
            <div key={q.id} className="rounded-xl border border-ink-700 bg-ink-900/40 p-5">
              <div className="flex items-start gap-3">
                <span className="text-slate-500 text-sm tabular-nums mt-0.5">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <span className="inline-block rounded-md bg-ink-800 px-2 py-0.5 text-xs text-slate-400 mb-2">
                    {q.role_title}
                  </span>
                  <p className="font-medium">{q.question}</p>
                </div>
                <span
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums ${
                    status === "skipped"
                      ? "bg-slate-700 text-slate-300"
                      : `text-white ${scoreColor(a!.score!)}`
                  }`}
                >
                  {status === "skipped" ? "Skipped" : a?.score}
                </span>
              </div>

              {a?.transcript && status === "answered" && (
                <p className="mt-3 text-sm text-slate-400 italic whitespace-pre-wrap">
                  &ldquo;{a.transcript}&rdquo;
                </p>
              )}
              {status === "answered" && a?.feedback && (
                <p className="mt-3 text-sm text-slate-300">{a.feedback}</p>
              )}

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {strengths.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-400/80 mb-1">
                      Strengths
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-0.5">
                      {strengths.map((s, k) => (
                        <li key={k}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {gaps.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-rose-400/80 mb-1">Gaps</p>
                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-0.5">
                      {gaps.map((g, k) => (
                        <li key={k}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {a?.interviewer_note && (
                <p className="mt-3 text-sm text-amber-300/90">
                  <span className="text-xs uppercase tracking-wide text-slate-500">Your note: </span>
                  {a.interviewer_note}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
