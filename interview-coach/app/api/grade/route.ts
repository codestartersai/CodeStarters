import { NextResponse } from "next/server";
import { getQuestion, getRole, getSession, upsertAnswer } from "@/lib/db";
import { GRADE_MODEL, getOpenAI } from "@/lib/openai";
import { GRADE_SYSTEM, buildGradeUser } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const sessionId = Number(body?.sessionId);
  const questionId = Number(body?.questionId);
  const transcript = (body?.transcript ?? "").toString();

  if (!Number.isFinite(sessionId) || sessionId <= 0) {
    return NextResponse.json({ error: "Invalid sessionId." }, { status: 400 });
  }
  if (!Number.isFinite(questionId) || questionId <= 0) {
    return NextResponse.json({ error: "Invalid questionId." }, { status: 400 });
  }

  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: `Session ${sessionId} not found.` }, { status: 400 });
  }

  const question = await getQuestion(questionId);
  const role = question ? await getRole(question.role_id) : undefined;
  if (!question) {
    return NextResponse.json(
      { error: `Question ${questionId} not found for session ${sessionId}.` },
      { status: 400 }
    );
  }

  const trimmedTranscript = transcript.trim();

  // No substantive answer — leave ungraded; skipped questions don't affect averages.
  if (!trimmedTranscript) {
    const result = {
      score: null as number | null,
      feedback: "",
      strengths: [] as string[],
      gaps: [] as string[],
    };
    const answer = await upsertAnswer({
      sessionId,
      questionId,
      transcript: trimmedTranscript,
      score: result.score,
      feedback: result.feedback,
      strengths: result.strengths,
      gaps: result.gaps,
    });
    return NextResponse.json({ answer, grade: result, skipped: true });
  }

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: GRADE_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: GRADE_SYSTEM },
        {
          role: "user",
          content: buildGradeUser(
            question.question,
            question.rubric,
            trimmedTranscript,
            role?.title
          ),
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");

    let score: number | null = Math.round(Number(parsed.score));
    if (!Number.isFinite(score)) score = null;
    else score = Math.min(100, Math.max(0, score));

    const strengths = Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [];
    const gaps = Array.isArray(parsed.gaps) ? parsed.gaps.map(String) : [];

    // Only cap nearly-empty answers (<5 words) — trust the model for everything else.
    const wordCount = trimmedTranscript.split(/\s+/).filter(Boolean).length;
    if (score != null && wordCount < 5) {
      score = Math.min(score, 30);
    }

    const result = {
      score,
      feedback: (parsed.feedback ?? "").toString(),
      strengths,
      gaps,
    };

    const answer = await upsertAnswer({
      sessionId,
      questionId,
      transcript: trimmedTranscript,
      score: result.score,
      feedback: result.feedback,
      strengths: result.strengths,
      gaps: result.gaps,
    });

    return NextResponse.json({ answer, grade: result });
  } catch (err) {
    console.error("grade failed", err);
    const message = err instanceof Error ? err.message : "Grading failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
