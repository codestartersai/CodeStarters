import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient, jsonWithCookies, verifyAdminUser } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function extractToken(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const value = raw.trim();
  try {
    const parsed = new URL(value);
    return parsed.searchParams.get("token")?.trim() ?? value;
  } catch {
    return value;
  }
}

const SUMMER_PROGRAMS = ["AI Development", "Advanced CS", "Basic CS", "Python"] as const;
const SUMMER_INTEREST_PREFIX = "Summer Program: ";

function parseSummerProgram(interest: string | null | undefined): string {
  if (!interest?.startsWith(SUMMER_INTEREST_PREFIX)) return "Unknown";
  return interest.slice(SUMMER_INTEREST_PREFIX.length);
}

function buildSummerStats(signups: Array<{ interest?: string | null }>) {
  const byProgram = Object.fromEntries(SUMMER_PROGRAMS.map((name) => [name, 0])) as Record<
    (typeof SUMMER_PROGRAMS)[number],
    number
  >;
  let unknown = 0;
  for (const signup of signups) {
    const program = parseSummerProgram(signup.interest ?? null);
    if (program in byProgram) {
      byProgram[program as (typeof SUMMER_PROGRAMS)[number]] += 1;
    } else {
      unknown += 1;
    }
  }
  return { byProgram, unknown, total: signups.length };
}

export const Route = createFileRoute("/api/admin/summer-signups")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const verified = await verifyAdminUser(request);
        if (!verified) {
          const bundle = getSupabaseServerClient(request);
          return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
        }

        const admin = getSupabaseAdminClient();
        const { data, error } = await admin
          .from("volunteers")
          .select(
            "id, name, email, phone, school, grade_level, interest, status, reason_for_joining, created_at",
          )
          .like("interest", `${SUMMER_INTEREST_PREFIX}%`)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Summer signups list error:", error);
          return jsonWithCookies(
            verified.bundle,
            { error: "Could not load summer signups." },
            { status: 500 },
          );
        }

        const signups = (data ?? []).map((row) => ({
          ...row,
          program: parseSummerProgram(row.interest),
        }));
        const stats = buildSummerStats(signups);

        return jsonWithCookies(verified.bundle, { stats, signups });
      },
      POST: async ({ request }) => {
        const verified = await verifyAdminUser(request);
        if (!verified) {
          const bundle = getSupabaseServerClient(request);
          return jsonWithCookies(bundle, { error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const token = extractToken(body.token);
        const checkIn = body.action === "check-in";
        if (!token) {
          return jsonWithCookies(
            verified.bundle,
            { error: "QR token is required." },
            { status: 400 },
          );
        }

        const admin = getSupabaseAdminClient();
        const { data: signup, error: lookupError } = await admin
          .from("volunteers")
          .select(
            "id, name, email, phone, school, grade_level, interest, status, availability, reason_for_joining, created_at",
          )
          .eq("social_links", token)
          .like("interest", "Summer Program:%")
          .maybeSingle();

        if (lookupError) {
          console.error("Summer signup lookup error:", lookupError);
          return jsonWithCookies(
            verified.bundle,
            { error: "Could not look up this QR code." },
            { status: 500 },
          );
        }
        if (!signup) {
          return jsonWithCookies(
            verified.bundle,
            { error: "No summer signup found for this QR code." },
            { status: 404 },
          );
        }

        if (checkIn && signup.status === "contacted") {
          return jsonWithCookies(verified.bundle, { ok: true, signup, checkedIn: true });
        }

        if (checkIn && signup.status !== "pending") {
          return jsonWithCookies(
            verified.bundle,
            { error: `This signup is ${signup.status ?? "not pending"} and cannot be checked in.` },
            { status: 400 },
          );
        }

        if (checkIn) {
          const { data: updated, error: updateError } = await admin
            .from("volunteers")
            .update({ status: "contacted" })
            .eq("id", signup.id)
            .select(
              "id, name, email, phone, school, grade_level, interest, status, availability, reason_for_joining, created_at",
            )
            .single();
          if (updateError) {
            console.error("Summer check-in update error:", updateError);
            return jsonWithCookies(
              verified.bundle,
              { error: "Could not mark this signup as checked in." },
              { status: 500 },
            );
          }
          return jsonWithCookies(verified.bundle, { ok: true, signup: updated, checkedIn: true });
        }

        return jsonWithCookies(verified.bundle, {
          ok: true,
          signup,
          checkedIn: signup.status === "contacted",
        });
      },
    },
  },
});
