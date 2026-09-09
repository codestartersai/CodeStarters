import type { ServerSupabaseBundle } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const WAIVER_BUCKET = "firehacks-waivers";

export const WAIVER_ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/heic",
  "image/heif",
]);

export const WAIVER_MAX_BYTES = 15 * 1024 * 1024;

export function safeWaiverFileName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "waiver"
  );
}

export function waiverPathForParticipant(
  eventId: string,
  participantId: string,
  fileName: string,
): string {
  return `${eventId}/${participantId}/${Date.now()}-${safeWaiverFileName(fileName)}`;
}

export function isWaiverPathForParticipant(
  path: string,
  eventId: string,
  participantId: string,
): boolean {
  const prefix = `${eventId}/${participantId}/`;
  return path.startsWith(prefix) && path.length > prefix.length;
}

type ParticipantRow = {
  id: string;
  event_id: string;
  waiver_storage_path: string | null;
};

export async function getAuthenticatedParticipant(bundle: ServerSupabaseBundle) {
  const {
    data: { user },
  } = await bundle.client.auth.getUser();
  if (!user) {
    return { error: { message: "Not authenticated", status: 401 as const } };
  }

  const admin = getSupabaseAdminClient();
  const { data: participant, error: participantError } = await admin
    .from("firehacks_participants")
    .select("id, event_id, waiver_storage_path")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (participantError) {
    return { error: { message: participantError.message, status: 500 as const } };
  }
  if (!participant) {
    return {
      error: { message: "No participant record linked to this account", status: 404 as const },
    };
  }

  return { participant: participant as ParticipantRow };
}

function inferWaiverContentType(fileName: string, contentType: string): string {
  if (contentType && WAIVER_ALLOWED_TYPES.has(contentType)) return contentType;
  const ext = fileName.split(".").pop()?.toLowerCase();
  const byExt: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    heic: "image/heic",
    heif: "image/heif",
  };
  return byExt[ext ?? ""] ?? contentType;
}

export function validateWaiverFileMeta(input: {
  fileName?: unknown;
  fileSize?: unknown;
  contentType?: unknown;
}) {
  const fileName = typeof input.fileName === "string" ? input.fileName.trim() : "";
  const rawType = typeof input.contentType === "string" ? input.contentType.trim() : "";
  const fileSize = typeof input.fileSize === "number" ? input.fileSize : Number(input.fileSize);
  const contentType = inferWaiverContentType(fileName, rawType);

  if (!fileName) return { error: "fileName is required" };
  if (!Number.isFinite(fileSize) || fileSize <= 0) return { error: "fileSize is required" };
  if (fileSize > WAIVER_MAX_BYTES) return { error: "File exceeds 15 MB limit" };
  if (!WAIVER_ALLOWED_TYPES.has(contentType)) {
    return { error: `Unsupported file type: ${rawType || contentType || "unknown"}` };
  }

  return { fileName, fileSize, contentType };
}
