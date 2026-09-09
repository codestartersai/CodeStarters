import type { SupabaseClient } from "@supabase/supabase-js";

export const RESUME_BUCKET = "volunteer-resumes";
export const RESUME_MAX_BYTES = 10 * 1024 * 1024;
export const RESUME_SIGNED_URL_SECONDS = 60 * 60;

const RESUME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function safeResumeFileName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "resume.pdf"
  );
}

export function resumePathForVolunteer(volunteerId: string, fileName: string): string {
  return `${volunteerId}/${safeResumeFileName(fileName)}`;
}

export function validateResumeFile(file: File): { error: string } | { contentType: string } {
  if (file.size > RESUME_MAX_BYTES) {
    return { error: "Resume must be 10 MB or smaller." };
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = RESUME_TYPES[ext] ?? file.type;
  if (!RESUME_TYPES[ext] && !Object.values(RESUME_TYPES).includes(contentType)) {
    return { error: "Please upload a PDF, DOC, or DOCX resume." };
  }
  return { contentType: RESUME_TYPES[ext] ?? contentType };
}

export async function attachResumeUrls<T extends { id?: string; resume_path?: string | null }>(
  admin: SupabaseClient,
  rows: T[],
): Promise<Array<T & { resume_url: string | null }>> {
  return Promise.all(
    rows.map(async (row) => {
      let path = row.resume_path?.trim() || "";
      if (!path && row.id) {
        const { data: files } = await admin.storage.from(RESUME_BUCKET).list(row.id, { limit: 5 });
        const file = files?.find((item) => item.name && !item.name.startsWith("."));
        if (file) path = `${row.id}/${file.name}`;
      }
      if (!path) return { ...row, resume_url: null };
      const { data } = await admin.storage
        .from(RESUME_BUCKET)
        .createSignedUrl(path, RESUME_SIGNED_URL_SECONDS);
      return { ...row, resume_url: data?.signedUrl ?? null };
    }),
  );
}
