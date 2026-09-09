import { NextResponse } from "next/server";
import { createRole, listRoles } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ roles: await listRoles() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const title = (body?.title ?? "").trim();
  const description = (body?.description ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  const role = await createRole(title, description);
  return NextResponse.json({ role }, { status: 201 });
}
