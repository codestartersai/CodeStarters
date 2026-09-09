import { NextResponse } from "next/server";
import {
  completeSession,
  getAnswers,
  getQuestionsForRoles,
  getRole,
  getSession,
  getSessionRoleIds,
  getSessionRoles,
  saveInterviewerNote,
} from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(Number(id));
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });

  const roleIds = getSessionRoleIds(session);
  const roles = await getSessionRoles(session.id);
  const role = await getRole(session.role_id);
  const questions = await getQuestionsForRoles(roleIds);
  const answers = await getAnswers(session.id);

  return NextResponse.json({ session, role, roles, questions, answers });
}

// PATCH handles two things: completing the session, or saving an interviewer note.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = Number(id);
  const session = await getSession(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });

  const body = await req.json().catch(() => ({}));

  if (body?.action === "complete") {
    return NextResponse.json({ session: await completeSession(sessionId) });
  }

  if (body?.action === "note") {
    const questionId = Number(body.questionId);
    if (!questionId) {
      return NextResponse.json({ error: "questionId is required." }, { status: 400 });
    }
    await saveInterviewerNote(sessionId, questionId, (body.note ?? "").toString());
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
