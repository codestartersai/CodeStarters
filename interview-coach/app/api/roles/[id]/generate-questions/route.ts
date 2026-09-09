import { NextResponse } from "next/server";
import { getRole, replaceQuestions } from "@/lib/db";
import { CHAT_MODEL, getOpenAI } from "@/lib/openai";
import { QUESTION_GEN_SYSTEM, buildQuestionGenUser } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

interface GeneratedQuestion {
  question: string;
  category: string;
  rubric: string;
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = await getRole(Number(id));
  if (!role) return NextResponse.json({ error: "Role not found." }, { status: 404 });

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: QUESTION_GEN_SYSTEM },
        { role: "user", content: buildQuestionGenUser(role.title, role.description) },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    const items: GeneratedQuestion[] = Array.isArray(parsed.questions) ? parsed.questions : [];

    const clean = items
      .filter((q) => q && typeof q.question === "string" && q.question.trim())
      .map((q) => ({
        question: q.question.trim(),
        category: (q.category ?? "general").toString().trim() || "general",
        rubric: (q.rubric ?? "").toString().trim(),
      }));

    if (clean.length === 0) {
      return NextResponse.json(
        { error: "The model returned no usable questions. Try again." },
        { status: 502 }
      );
    }

    const questions = await replaceQuestions(role.id, clean);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error("generate-questions failed", err);
    const message = err instanceof Error ? err.message : "Question generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
