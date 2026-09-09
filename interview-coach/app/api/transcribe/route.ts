import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { WHISPER_MODEL, getOpenAI } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MIN_BYTES = 400;
const MAX_BYTES = 24 * 1024 * 1024;

function normalizeMimeType(type: string | undefined): string {
  const base = (type ?? "audio/webm").split(";")[0]?.trim() || "audio/webm";
  if (base === "video/webm") return "audio/webm";
  return base;
}

function extensionForMime(mime: string): string {
  if (mime.includes("ogg")) return "audio.ogg";
  if (mime.includes("mp4") || mime.includes("m4a")) return "audio.m4a";
  if (mime.includes("wav")) return "audio.wav";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "audio.mp3";
  return "audio.webm";
}

function isInvalidAudioFormatError(err: unknown): boolean {
  if (!(err instanceof OpenAI.APIError)) return false;
  const msg = err.message.toLowerCase();
  return (
    err.status === 400 &&
    (msg.includes("invalid file format") ||
      msg.includes("could not be decoded") ||
      msg.includes("corrupted") ||
      msg.includes("unsupported audio"))
  );
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is not configured. Add it in .env.local (dev) or Vercel project settings (production).",
        },
        { status: 503 }
      );
    }

    const form = await req.formData();
    const audio = form.get("audio");

    if (!(audio instanceof File) || audio.size === 0) {
      return NextResponse.json({ error: "No audio uploaded." }, { status: 400 });
    }

    if (audio.size < MIN_BYTES) {
      return NextResponse.json({
        transcript: "",
        skipped: true,
        reason: "Audio chunk too small to transcribe.",
      });
    }

    if (audio.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `Audio file too large (${audio.size} bytes). Max is ${MAX_BYTES} bytes.` },
        { status: 413 }
      );
    }

    const mime = normalizeMimeType(audio.type);
    const buffer = Buffer.from(await audio.arrayBuffer());
    const file = await toFile(buffer, extensionForMime(mime), { type: mime });

    const openai = getOpenAI();
    const result = await openai.audio.transcriptions.create({
      model: WHISPER_MODEL,
      file,
      response_format: "json",
    });

    return NextResponse.json({ transcript: (result.text ?? "").trim() });
  } catch (err) {
    if (isInvalidAudioFormatError(err)) {
      console.warn("transcribe skipped invalid audio chunk", err);
      return NextResponse.json({
        transcript: "",
        skipped: true,
        reason: "Unrecognized audio chunk — skipped (often silence or a partial WebM fragment).",
      });
    }

    console.error("transcribe failed", err);
    const message =
      err instanceof OpenAI.APIError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Transcription failed.";
    const status =
      err instanceof OpenAI.APIError && err.status ? err.status : 500;
    return NextResponse.json({ error: message }, { status: status >= 400 ? status : 500 });
  }
}
