import {
  getAnswers,
  getQuestionsForRoles,
  getSession,
  getSessionRoleIds,
  getSessionRoles,
  saveSessionHolistic,
  type Session,
} from "./db";
import { GRADE_MODEL, getOpenAI } from "./openai";
import { FINALIZE_SYSTEM, buildFinalizeUser } from "./prompts";
import { answeredAnswers, averageAnsweredScore, hireBand, interviewerNotesFingerprint } from "./scoring";
import type { FinalizeResult } from "./types";

function safeParse(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function normalizeRecommendation(score: number, raw: string): string {
  const label = raw.trim();
  const valid = ["Strong hire", "Hire", "Lean / mixed", "No hire"];
  if (valid.includes(label)) return label;
  return hireBand(score).label;
}

export function sessionNeedsFinalize(session: Session): boolean {
  return session.overall_score == null || !session.holistic_summary?.trim();
}

export async function finalizeSession(
  sessionId: number,
  options?: { force?: boolean }
): Promise<{
  session: Session;
  result: FinalizeResult;
  cached: boolean;
}> {
  const session = await getSession(sessionId);
  if (!session) throw new Error("Session not found.");

  const answers = await getAnswers(sessionId);
  const notesFingerprint = interviewerNotesFingerprint(answers);

  const hasHolistic =
    session.overall_score != null &&
    session.holistic_summary?.trim() &&
    session.hire_recommendation?.trim();

  if (
    !options?.force &&
    hasHolistic &&
    session.finalized_notes_fingerprint === notesFingerprint
  ) {
    return {
      session,
      result: {
        overall_score: Math.round(session.overall_score!),
        hire_recommendation: session.hire_recommendation!,
        holistic_summary: session.holistic_summary!,
        best_fit_role: session.best_fit_role ?? "",
        best_fit_role_secondary: session.best_fit_role_secondary ?? null,
        best_fit_rationale: session.best_fit_rationale ?? "",
      },
      cached: true,
    };
  }

  const roleIds = getSessionRoleIds(session);
  const roles = await getSessionRoles(sessionId);
  const questions = await getQuestionsForRoles(roleIds);
  const answered = answeredAnswers(answers);
  const answerByQ = new Map(answers.map((a) => [a.question_id, a]));
  const perQuestionAverage = averageAnsweredScore(answers);

  const answeredPayload = questions
    .map((q) => {
      const a = answerByQ.get(q.id);
      if (!a || !answered.includes(a)) return null;
      return {
        question: q.question,
        roleTitle: q.role_title,
        category: q.category,
        rubric: q.rubric,
        transcript: a.transcript,
        score: a.score ?? 0,
        feedback: a.feedback,
        strengths: safeParse(a.strengths),
        gaps: safeParse(a.gaps),
        interviewerNote: a.interviewer_note?.trim() || undefined,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  let result: FinalizeResult;

  if (answeredPayload.length === 0) {
    result = {
      overall_score: 0,
      hire_recommendation: "No hire",
      holistic_summary:
        "No questions were answered in this interview, so there isn't enough to assess. Encourage the candidate to try again when they're ready.",
      best_fit_role: roles[0]?.title ?? "Unknown",
      best_fit_role_secondary: null,
      best_fit_rationale: "Insufficient answered questions to determine role fit.",
    };
  } else {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: GRADE_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: FINALIZE_SYSTEM },
        {
          role: "user",
          content: buildFinalizeUser({
            intervieweeName: session.interviewee_name,
            roles: roles.map((r) => ({ title: r.title, description: r.description })),
            answered: answeredPayload,
            perQuestionAverage,
            totalQuestions: questions.length,
            answeredCount: answered.length,
          }),
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
    let overall_score = Math.round(Number(parsed.overall_score));
    if (!Number.isFinite(overall_score)) {
      overall_score =
        perQuestionAverage != null ? Math.round(perQuestionAverage) : 0;
    }
    overall_score = Math.min(100, Math.max(0, overall_score));

    const secondary = parsed.best_fit_role_secondary;
    result = {
      overall_score,
      hire_recommendation: normalizeRecommendation(
        overall_score,
        String(parsed.hire_recommendation ?? "")
      ),
      holistic_summary: String(parsed.holistic_summary ?? "").trim(),
      best_fit_role: String(parsed.best_fit_role ?? roles[0]?.title ?? "").trim(),
      best_fit_role_secondary:
        secondary == null || secondary === "null" || secondary === ""
          ? null
          : String(secondary).trim(),
      best_fit_rationale: String(parsed.best_fit_rationale ?? "").trim(),
    };

    if (!result.holistic_summary) {
      result.holistic_summary = `Completed ${answered.length} of ${questions.length} questions with an average of ${perQuestionAverage != null ? Math.round(perQuestionAverage) : "n/a"}.`;
    }
    if (!result.best_fit_role) result.best_fit_role = roles[0]?.title ?? "Unknown";
  }

  const updated = await saveSessionHolistic(sessionId, {
    ...result,
    finalized_notes_fingerprint: notesFingerprint,
  });
  if (!updated) throw new Error("Failed to save session.");

  return { session: updated, result, cached: false };
}
