"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  behavioral: "bg-sky-500/15 text-sky-300",
  scenario: "bg-violet-500/15 text-violet-300",
  leadership: "bg-amber-500/15 text-amber-300",
  technical: "bg-emerald-500/15 text-emerald-300",
  judgment: "bg-rose-500/15 text-rose-300",
  culture: "bg-teal-500/15 text-teal-300",
};

export default function QuestionList({ questions }: { questions: Question[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ol className="space-y-2">
      {questions.map((q, i) => {
        const isOpen = open === q.id;
        const color = CATEGORY_COLORS[q.category] ?? "bg-slate-500/15 text-slate-300";
        return (
          <li key={q.id} className="rounded-lg border border-ink-700 bg-ink-900/40">
            <button
              onClick={() => setOpen(isOpen ? null : q.id)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left"
            >
              <span className="text-slate-500 text-sm tabular-nums mt-0.5">{i + 1}.</span>
              <span className="flex-1 text-sm">{q.question}</span>
              <span className={`shrink-0 rounded px-2 py-0.5 text-xs ${color}`}>{q.category}</span>
            </button>
            {isOpen && (
              <div className="border-t border-ink-700 px-4 py-3 bg-ink-950/40">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                  Rubric · interviewer only
                </p>
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-300">
                  {q.rubric || "No rubric."}
                </pre>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
