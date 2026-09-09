import { createFileRoute } from "@tanstack/react-router";
import { EXPEDITED_REASON, isHighSchoolGrade } from "@/lib/expedited";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  RESUME_BUCKET,
  resumePathForVolunteer,
  validateResumeFile,
} from "@/lib/volunteer-resumes";

function clean(value: FormDataEntryValue | null, max = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export const Route = createFileRoute("/api/volunteers")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "Expected form data." }, { status: 400 });
        }

        const name = clean(form.get("name"), 120);
        const email = clean(form.get("email"), 180).toLowerCase();
        const phone = clean(form.get("phone"), 80);
        const school = clean(form.get("school"), 160);
        const grade_level = clean(form.get("grade"), 80);
        const interest = clean(form.get("interest"), 120);
        const social_links = clean(form.get("socialLinks"), 500);
        const previous_experience = clean(form.get("experience"), 2000);
        const bayArea = clean(form.get("bayArea"), 20).toLowerCase();
        const expedited =
          clean(form.get("expedited"), 20).toLowerCase() === "yes" ||
          clean(form.get("reason"), 2000).toLowerCase().startsWith("expedited");
        const availability =
          clean(form.get("availability"), 500) || (expedited ? "Flexible" : "");
        const reason_for_joining =
          clean(form.get("reason"), 2000) || (expedited ? EXPEDITED_REASON : "");

        if (!name || !email || !school || !grade_level || !interest || !availability || !reason_for_joining) {
          return Response.json({ error: "Please complete all required fields." }, { status: 400 });
        }

        if (!isHighSchoolGrade(grade_level)) {
          return Response.json(
            { error: "We only hire current high school students (grades 9–12)." },
            { status: 400 },
          );
        }

        if (bayArea !== "yes" && bayArea !== "on" && bayArea !== "true") {
          return Response.json(
            { error: "We only hire people who live in the Bay Area." },
            { status: 400 },
          );
        }

        const resume = form.get("resume");
        let resumeFile: { file: File; contentType: string } | null = null;
        if (resume instanceof File && resume.size > 0) {
          const validated = validateResumeFile(resume);
          if ("error" in validated) {
            const status = validated.error.includes("10 MB") ? 413 : 400;
            return Response.json({ error: validated.error }, { status });
          }
          resumeFile = { file: resume, contentType: validated.contentType };
        }

        const admin = getSupabaseAdminClient();
        const { data: volunteer, error: insertError } = await admin
          .from("volunteers")
          .insert([
            {
              name,
              email,
              phone: phone || null,
              school,
              grade_level,
              interest,
              availability,
              social_links: social_links || null,
              reason_for_joining,
              previous_experience: previous_experience || null,
              status: "pending",
            },
          ])
          .select("id")
          .single();

        if (insertError || !volunteer?.id) {
          return Response.json(
            { error: insertError?.message || "Failed to submit. Please try again." },
            { status: 500 },
          );
        }

        if (resumeFile) {
          const resume_path = resumePathForVolunteer(volunteer.id, resumeFile.file.name);
          const buffer = Buffer.from(await resumeFile.file.arrayBuffer());
          const { error: uploadError } = await admin.storage.from(RESUME_BUCKET).upload(resume_path, buffer, {
            contentType: resumeFile.contentType,
            upsert: false,
          });
          if (uploadError) {
            return Response.json(
              { error: "Application received, but the resume could not be uploaded. Please email it to us." },
              { status: 500 },
            );
          }
        }

        return Response.json({ ok: true });
      },
    },
  },
});
