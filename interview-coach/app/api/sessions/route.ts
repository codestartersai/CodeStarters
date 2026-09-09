import { NextResponse } from "next/server";
import { createSession, getQuestions, getRole, listSessions } from "@/lib/db";

export const runtime = "nodejs";

function parseRoleIds(body: Record<string, unknown> | null): number[] {
  if (!body) return [];
  if (Array.isArray(body.roleIds)) {
    return [...new Set(body.roleIds.map(Number).filter((n) => n > 0))];
  }
  const single = Number(body.roleId);
  return single > 0 ? [single] : [];
}

export async function GET() {
  return NextResponse.json({ sessions: await listSessions() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const roleIds = parseRoleIds(body);
  const intervieweeName = (body?.intervieweeName ?? "").trim();

  if (roleIds.length === 0) {
    return NextResponse.json({ error: "At least one valid role is required." }, { status: 400 });
  }

  for (const roleId of roleIds) {
    if (!(await getRole(roleId))) {
      return NextResponse.json({ error: `Role ${roleId} not found.` }, { status: 400 });
    }
    if ((await getQuestions(roleId)).length === 0) {
      const role = await getRole(roleId);
      return NextResponse.json(
        {
          error: `Generate questions for "${role?.title ?? roleId}" before starting an interview.`,
        },
        { status: 400 }
      );
    }
  }

  const session = await createSession(roleIds, intervieweeName);
  return NextResponse.json({ session }, { status: 201 });
}
