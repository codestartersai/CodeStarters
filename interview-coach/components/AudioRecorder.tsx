"use client";

import { useEffect, useRef, useState } from "react";

type RecorderState = "idle" | "recording" | "processing";

export default function AudioRecorder({
  state,
  onStart,
  onStop,
  disabled,
}: {
  state: RecorderState;
  onStart: () => void;
  onStop: (blob: Blob) => void;
  disabled?: boolean;
}) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  // Tick the elapsed timer while recording.
  useEffect(() => {
    if (state !== "recording") return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  async function startRecording() {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        onStop(blob);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      onStart();
    } catch {
      setMicError("Microphone access was blocked. Allow mic permission and try again.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const secs = String(elapsed % 60).padStart(2, "0");

  return (
    <div>
      {state === "recording" ? (
        <button
          onClick={stopRecording}
          className="w-full rounded-xl bg-red-500 hover:bg-red-600 transition px-6 py-4 text-lg font-semibold text-white flex items-center justify-center gap-3"
        >
          <span className="inline-block h-3 w-3 rounded-sm bg-white animate-pulse" />
          Stop Recording · {mins}:{secs}
        </button>
      ) : (
        <button
          onClick={startRecording}
          disabled={disabled || state === "processing"}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 transition px-6 py-4 text-lg font-semibold text-white flex items-center justify-center gap-3"
        >
          <span className="inline-block h-3 w-3 rounded-full bg-white" />
          {state === "processing" ? "Processing…" : "Record Answer"}
        </button>
      )}
      {micError && <p className="mt-2 text-sm text-red-400">{micError}</p>}
    </div>
  );
}
