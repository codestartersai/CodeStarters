/**
 * Re-run holistic finalize for all completed sessions (incorporates interviewer notes).
 *
 * Local (direct — reads/writes data/store.json, no dev server):
 *   npm run refinalize-all
 *   npm run refinalize-all -- --dry-run
 *
 * Via HTTP API (dev server or Vercel must be running):
 *   npm run refinalize-all -- --url http://localhost:3000
 *
 * Production on Vercel uses /tmp/interview-coach-data/store.json — that file is ephemeral
 * and may not match your local data/store.json. Run this script locally for durable data.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { finalizeSession } from "../lib/finalize";
import { getAnswers, getSession } from "../lib/db";
import {
  answeredAnswers,
  hasInterviewerNotes,
  interviewerNotesFingerprint,
} from "../lib/scoring";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = val;
  }
}

function parseArgs(argv: string[]) {
  let baseUrl: string | null = null;
  let dryRun = false;
  let includeIncomplete = false;
  let force = true;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--include-incomplete") includeIncomplete = true;
    else if (a === "--no-force") force = false;
    else if (a === "--url") baseUrl = argv[++i] ?? null;
  }

  return { baseUrl, dryRun, includeIncomplete, force };
}

type StoreShape = {
  sessions: Array<{
    id: number;
    interviewee_name: string;
    completed_at: string | null;
    finalized_notes_fingerprint?: string | null;
  }>;
  answers: Array<{ session_id: number; interviewer_note?: string }>;
};

function loadStoreSessions(): StoreShape["sessions"] {
  const storePath = path.join(root, "data", "store.json");
  if (!existsSync(storePath)) {
    throw new Error(`No store at ${storePath}. Run interviews locally first.`);
  }
  const store = JSON.parse(readFileSync(storePath, "utf8")) as StoreShape;
  return store.sessions ?? [];
}

async function sessionHasAnswers(sessionId: number): Promise<boolean> {
  return (await getAnswers(sessionId)).length > 0;
}

async function finalizeViaApi(
  baseUrl: string,
  sessionId: number,
  force: boolean
): Promise<{ cached: boolean; result: Record<string, unknown> }> {
  const url = `${baseUrl}/api/sessions/${sessionId}/finalize${force ? "?force=true" : ""}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ force }),
  });
  const data = (await res.json()) as {
    error?: string;
    cached?: boolean;
    result?: Record<string, unknown>;
  };
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return { cached: data.cached ?? false, result: data.result ?? {} };
}

async function main() {
  loadEnvLocal();
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.baseUrl && !process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is required for direct finalize. Set it in .env.local or use --url with a running server."
    );
  }

  const sessions = loadStoreSessions();
  const candidates = [];
  for (const s of sessions) {
    if (!(await sessionHasAnswers(s.id))) continue;
    if (!opts.includeIncomplete && !s.completed_at) continue;
    candidates.push(s);
  }

  const skipped = [];
  for (const s of sessions) {
    if (!(await sessionHasAnswers(s.id))) continue;
    if (!candidates.some((c) => c.id === s.id)) skipped.push(s);
  }

  console.log(`Found ${candidates.length} session(s) to refinalize (${skipped.length} skipped).\n`);

  if (opts.dryRun) {
    for (const s of candidates) {
      const answers = await getAnswers(s.id);
      const notes = hasInterviewerNotes(answers);
      const fp = interviewerNotesFingerprint(answers);
      console.log(
        `- #${s.id} ${s.interviewee_name || "Unnamed"} | notes: ${notes ? "yes" : "no"} | fingerprint: ${fp || "(empty)"}`
      );
    }
    for (const s of skipped) {
      console.log(`  skipped #${s.id} ${s.interviewee_name || "Unnamed"} (incomplete)`);
    }
    return;
  }

  const results: Array<{
    id: number;
    name: string;
    cached: boolean;
    overall_score?: number;
    hire_recommendation?: string;
    best_fit_role?: string;
    fingerprint?: string | null;
    error?: string;
  }> = [];

  for (const s of candidates) {
    const name = s.interviewee_name || "Unnamed";
    process.stdout.write(`Finalizing #${s.id} ${name}… `);
    try {
      let cached = false;
      let result: Record<string, unknown> = {};
      let fingerprint: string | null = null;

      if (opts.baseUrl) {
        const api = await finalizeViaApi(opts.baseUrl, s.id, opts.force);
        cached = api.cached;
        result = api.result;
        const updated = await getSession(s.id);
        fingerprint = updated?.finalized_notes_fingerprint ?? null;
      } else {
        const out = await finalizeSession(s.id, { force: opts.force });
        cached = out.cached;
        result = out.result as unknown as Record<string, unknown>;
        fingerprint = out.session.finalized_notes_fingerprint ?? null;
      }

      console.log(cached ? "cached" : "done");
      results.push({
        id: s.id,
        name,
        cached,
        overall_score: Number(result.overall_score),
        hire_recommendation: String(result.hire_recommendation ?? ""),
        best_fit_role: String(result.best_fit_role ?? ""),
        fingerprint,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`FAILED: ${msg}`);
      results.push({ id: s.id, name, cached: false, error: msg });
    }
  }

  console.log("\n--- Summary ---");
  const ok = results.filter((r) => !r.error && !r.cached);
  const cachedOnly = results.filter((r) => !r.error && r.cached);
  const failed = results.filter((r) => r.error);

  console.log(`Re-analyzed: ${ok.length}`);
  console.log(`Already up to date (cached): ${cachedOnly.length}`);
  console.log(`Failed: ${failed.length}`);

  if (ok.length > 0) {
    console.log("\nRe-analyzed sessions:");
    for (const r of ok) {
      console.log(
        `  #${r.id} ${r.name} — score ${r.overall_score}, ${r.hire_recommendation}, best fit: ${r.best_fit_role}`
      );
    }
  }

  if (skipped.length > 0) {
    console.log("\nSkipped (incomplete):");
    for (const s of skipped) {
      console.log(`  #${s.id} ${s.interviewee_name || "Unnamed"}`);
    }
  }

  if (failed.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
