"use client";

import type { Grade } from "@/lib/types";

function scoreColor(score: number): string {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-emerald-600/80";
  if (score >= 55) return "bg-amber-500";
  if (score >= 35) return "bg-orange-500";
  return "bg-red-500";
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null;
  return (
    <span
      className={`inline-flex min-w-[3.25rem] h-9 px-2 items-center justify-center rounded-lg text-white font-bold tabular-nums ${scoreColor(score)}`}
    >
      {score}
    </span>
  );
}

export default function GradePanel({
  transcript,
  grade,
  processing,
}: {
  transcript: string;
  grade: Grade | null;
  processing: boolean;
}) {
  if (processing) {
    return (
      <div className="rounded-lg border border-ink-700 bg-ink-900/40 p-4 text-sm text-slate-400">
        Transcribing and scoring…
      </div>
    );
  }

  if (!transcript && !grade) {
    return (
      <div className="rounded-lg border border-dashed border-ink-700 p-4 text-sm text-slate-500">
        Transcript and grade appear here after you stop recording.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transcript && (
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Transcript</p>
          <p className="text-sm text-slate-300 whitespace-pre-wrap rounded-lg border border-ink-700 bg-ink-900/40 p-3">
            {transcript}
          </p>
        </div>
      )}

      {grade && (
        <div className="rounded-lg border border-ink-700 bg-ink-900/40 p-4">
          <div className="flex items-center gap-3">
            <ScoreBadge score={grade.score} />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Score</p>
              <p className="text-sm">
                {grade.score != null ? `${grade.score} / 100` : "Not scored"}
              </p>
            </div>
          </div>

          {grade.feedback && (
            <p className="mt-3 text-sm text-slate-300">{grade.feedback}</p>
          )}

          {grade.strengths.length > 0 && (
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wide text-emerald-400/80 mb-1">Strengths</p>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-0.5">
                {grade.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {grade.gaps.length > 0 && (
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wide text-rose-400/80 mb-1">Gaps</p>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-0.5">
                {grade.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
