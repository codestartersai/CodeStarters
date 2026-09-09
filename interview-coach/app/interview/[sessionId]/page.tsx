"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import InterviewerCockpit from "@/components/InterviewerCockpit";
import type { Answer, QuestionWithRole, Role, Session } from "@/lib/types";

interface SessionPayload {
  session: Session;
  roles: Role[];
  questions: QuestionWithRole[];
  answers: Answer[];
}

export default function InterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [payload, setPayload] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.session) setPayload(d);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <p className="text-slate-500 text-sm">Loading interview…</p>;
  if (!payload)
    return (
      <div className="text-sm text-slate-400">
        Session not found.{" "}
        <Link href="/" className="text-accent-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );

  return (
    <InterviewerCockpit
      session={payload.session}
      roles={payload.roles ?? []}
      questions={payload.questions}
      initialAnswers={payload.answers}
    />
  );
}
