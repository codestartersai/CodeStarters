import { NextResponse } from "next/server";
import { finalizeSession } from "@/lib/finalize";
import { getSession } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = Number(id);
  if (!sessionId) {
    return NextResponse.json({ error: "Invalid session id." }, { status: 400 });
  }

  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const url = new URL(req.url);
  let force = url.searchParams.get("force") === "true";
  if (!force) {
    try {
      const body = await req.json();
      force = body?.force === true;
    } catch {
      // empty body is fine
    }
  }

  try {
    const { session: updated, result, cached } = await finalizeSession(sessionId, { force });
    return NextResponse.json({ session: updated, result, cached });
  } catch (err) {
    console.error("finalize failed", err);
    const message = err instanceof Error ? err.message : "Finalize failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
