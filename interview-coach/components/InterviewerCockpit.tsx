"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import AudioRecorder from "@/components/AudioRecorder";
import GradePanel from "@/components/GradePanel";
import type { Answer, Grade, QuestionWithRole, Role, Session } from "@/lib/types";

type RecorderState = "idle" | "recording" | "processing";

interface PerQuestion {
  transcript: string;
  grade: Grade | null;
  note: string;
}

function roleBadge(title: string): string {
  if (title === "Vice-President") return "VP";
  if (title.startsWith("Head of ")) return title.replace("Head of ", "");
  if (title.length <= 14) return title;
  return title
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function InterviewerCockpit({
  session,
  roles,
  questions,
  initialAnswers,
}: {
  session: Session;
  roles: Role[];
  questions: QuestionWithRole[];
  initialAnswers: Answer[];
}) {
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);

  const [data, setData] = useState<Record<number, PerQuestion>>(() => {
    const seed: Record<number, PerQuestion> = {};
    for (const a of initialAnswers) {
      seed[a.question_id] = {
        transcript: a.transcript,
        grade:
          a.score != null || a.feedback
            ? {
                score: a.score,
                feedback: a.feedback,
                strengths: safeParse(a.strengths),
                gaps: safeParse(a.gaps),
              }
            : null,
        note: a.interviewer_note,
      };
    }
    return seed;
  });

  const roleTitles = useMemo(() => roles.map((r) => r.title).join(" + "), [roles]);

  const current = questions[index];
  const currentData: PerQuestion = data[current?.id] ?? {
    transcript: "",
    grade: null,
    note: "",
  };

  const answeredCount = useMemo(() => {
    let count = 0;
    for (const q of questions) {
      const d = data[q.id];
      if (d?.transcript.trim() && d.grade?.score != null) count++;
    }
    return count;
  }, [data, questions]);

  useEffect(() => {
    setRecorderState("idle");
  }, [index]);

  function update(questionId: number, patch: Partial<PerQuestion>) {
    setData((prev) => ({
      ...prev,
      [questionId]: { ...{ transcript: "", grade: null, note: "" }, ...prev[questionId], ...patch },
    }));
  }

  async function gradeTranscript(qId: number, transcript: string) {
    const gRes = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id, questionId: qId, transcript }),
    });
    const gData = await gRes.json();
    if (!gRes.ok) throw new Error(gData.error ?? "Grading failed.");
    update(qId, { grade: gData.grade });
  }

  async function submitTextAnswer() {
    const q = current;
    const transcript = currentData.transcript.trim();
    if (!transcript) {
      setError("Type or record an answer first.");
      return;
    }
    setRecorderState("processing");
    setError(null);
    try {
      await gradeTranscript(q.id, transcript);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setRecorderState("idle");
    }
  }

  async function handleStop(blob: Blob) {
    const q = current;
    setRecorderState("processing");
    setError(null);
    try {
      const form = new FormData();
      form.append("audio", blob, "answer.webm");
      const tRes = await fetch("/api/transcribe", { method: "POST", body: form });
      const tData = await tRes.json();
      if (!tRes.ok) throw new Error(tData.error ?? "Transcription failed.");
      const transcript: string = tData.transcript ?? "";
      update(q.id, { transcript });
      await gradeTranscript(q.id, transcript);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setRecorderState("idle");
    }
  }

  const saveNote = useCallback(
    async (questionId: number, note: string) => {
      await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "note", questionId, note }),
      }).catch(() => {});
    },
    [session.id]
  );

  async function endInterview() {
    setEnding(true);
    setError(null);
    try {
      await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      router.push(`/summary/${session.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not end interview.");
      setEnding(false);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(questions.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [questions.length]);

  if (!current) return <p className="text-slate-400">No questions for this session.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-700 bg-ink-900/60 px-5 py-3">
        <div>
          <p className="font-medium">
            {roleTitles}
            <span className="text-slate-500">
              {" "}
              · {session.interviewee_name || "Interviewee"}
            </span>
          </p>
          <p className="text-xs text-slate-500">
            Question {index + 1} of {questions.length} · {answeredCount} of {questions.length}{" "}
            answered
          </p>
        </div>
        <div className="flex items-center gap-2">
          {recorderState === "recording" && (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> REC
            </span>
          )}
          <button
            onClick={endInterview}
            disabled={ending}
            className="rounded-lg border border-ink-600 hover:bg-ink-800 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            {ending ? "Ending…" : "End Interview"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-ink-700 bg-ink-900/40 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs uppercase tracking-wide text-accent-400">Ask this — read aloud</p>
            <span
              className="rounded-md bg-ink-800 px-2 py-0.5 text-xs font-medium text-slate-300"
              title={current.role_title}
            >
              {roleBadge(current.role_title)}
            </span>
          </div>
          <p className="text-2xl font-medium leading-snug flex-1">{current.question}</p>

          <div className="mt-6 space-y-3">
            <AudioRecorder
              state={recorderState}
              onStart={() => setRecorderState("recording")}
              onStop={handleStop}
              disabled={recorderState === "processing"}
            />

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink-700" />
              </div>
              <p className="relative mx-auto w-fit bg-ink-900/40 px-2 text-xs text-slate-500">
                or type their answer
              </p>
            </div>

            <textarea
              value={currentData.transcript}
              onChange={(e) => update(current.id, { transcript: e.target.value, grade: null })}
              rows={4}
              disabled={recorderState === "processing" || recorderState === "recording"}
              placeholder="Type what they said, or your notes on their answer…"
              className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm outline-none focus:border-accent-500 resize-y disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void submitTextAnswer()}
              disabled={
                recorderState === "processing" ||
                recorderState === "recording" ||
                !currentData.transcript.trim()
              }
              className="w-full rounded-lg border border-ink-600 hover:bg-ink-800 disabled:opacity-40 transition px-4 py-2 text-sm font-medium"
            >
              {recorderState === "processing" ? "Scoring…" : "Grade typed answer"}
            </button>

            <div className="flex justify-between gap-3">
              <button
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="rounded-lg border border-ink-600 hover:bg-ink-800 px-4 py-2 text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                disabled={index === questions.length - 1}
                className="flex-1 rounded-lg bg-accent-500 hover:bg-accent-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
              >
                Next Question →
              </button>
            </div>
            <p className="text-center text-xs text-slate-600">Use ← → arrow keys to navigate</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.03] p-6">
          <p className="text-xs uppercase tracking-wide text-amber-400 mb-3">
            Private — interviewer only
          </p>

          {current.rubric && (
            <details className="mb-4 group" open>
              <summary className="cursor-pointer text-xs uppercase tracking-wide text-slate-500 mb-2">
                Rubric hints
              </summary>
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-300 mt-2">
                {current.rubric}
              </pre>
            </details>
          )}

          <GradePanel
            transcript={currentData.transcript}
            grade={currentData.grade}
            processing={recorderState === "processing"}
          />

          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">
              Your note
            </label>
            <textarea
              value={currentData.note}
              onChange={(e) => update(current.id, { note: e.target.value })}
              onBlur={(e) => saveNote(current.id, e.target.value)}
              rows={2}
              placeholder="e.g. seemed nervous but answer was solid"
              className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm outline-none focus:border-accent-500 resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function safeParse(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
