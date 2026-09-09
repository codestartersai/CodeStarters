import { NextResponse } from "next/server";
import { deleteRole, getQuestions, getRole } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = await getRole(Number(id));
  if (!role) return NextResponse.json({ error: "Role not found." }, { status: 404 });
  return NextResponse.json({ role, questions: await getQuestions(role.id) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteRole(Number(id));
  return NextResponse.json({ ok: true });
}
