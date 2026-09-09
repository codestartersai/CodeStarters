import type { Answer } from "./types";

/** Question was actually answered: non-empty transcript and a graded score. */
export function isAnswered(answer: Answer): boolean {
  return answer.transcript.trim().length > 0 && answer.score != null;
}

export function answeredAnswers(answers: Answer[]): Answer[] {
  return answers.filter(isAnswered);
}

export function averageAnsweredScore(answers: Answer[]): number | null {
  const scored = answeredAnswers(answers);
  if (scored.length === 0) return null;
  return scored.reduce((sum, a) => sum + (a.score ?? 0), 0) / scored.length;
}

export type HireBand = { label: string; color: string };

/** Lenient student-volunteer hire bands (holistic / overall score). */
export function hireBand(score: number | null): HireBand {
  if (score == null) return { label: "Not enough data", color: "text-slate-400" };
  if (score >= 75) return { label: "Strong hire", color: "text-emerald-400" };
  if (score >= 60) return { label: "Hire", color: "text-emerald-300" };
  if (score >= 45) return { label: "Lean / mixed", color: "text-amber-400" };
  return { label: "No hire", color: "text-red-400" };
}

export function effectiveOverallScore(session: {
  overall_score?: number | null;
}): number | null {
  if (session.overall_score != null && Number.isFinite(session.overall_score)) {
    return Math.round(session.overall_score);
  }
  return null;
}

/** Stable fingerprint of all interviewer notes — used to detect stale holistic assessments. */
export function interviewerNotesFingerprint(answers: Answer[]): string {
  return answers
    .map((a) => `${a.question_id}:${(a.interviewer_note ?? "").trim()}`)
    .sort((a, b) => a.localeCompare(b))
    .join("|");
}

export function hasInterviewerNotes(answers: Answer[]): boolean {
  return answers.some((a) => (a.interviewer_note ?? "").trim().length > 0);
}

export function notesFingerprintStale(
  session: {
    finalized_notes_fingerprint?: string | null;
    holistic_summary?: string | null;
  },
  answers: Answer[]
): boolean {
  if (!session.holistic_summary?.trim()) return false;
  const current = interviewerNotesFingerprint(answers);
  if (session.finalized_notes_fingerprint == null) return true;
  return session.finalized_notes_fingerprint !== current;
}
