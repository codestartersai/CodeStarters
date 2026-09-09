/**
 * Simplify existing question rubrics to plain-English, student-appropriate format.
 * Run: node scripts/simplify-rubrics.mjs [--role-id=2] [--dry-run]
 * Requires OPENAI_API_KEY in .env.local
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { RUBRIC_SIMPLIFY_SYSTEM } from "./rubric-constants.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const storePath = path.join(root, "data", "store.json");
const envPath = path.join(root, ".env.local");

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error("Missing .env.local — add OPENAI_API_KEY first.");
    process.exit(1);
  }
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

function parseArgs() {
  const args = { roleId: null, dryRun: false, batchSize: 8 };
  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg.startsWith("--role-id=")) args.roleId = Number(arg.split("=")[1]);
    else if (arg.startsWith("--batch=")) args.batchSize = Number(arg.split("=")[1]);
  }
  return args;
}

async function simplifyBatch(openai, model, items) {
  const payload = items.map((q) => ({
    id: q.id,
    question: q.question,
    category: q.category,
    rubric: q.rubric,
  }));

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: RUBRIC_SIMPLIFY_SYSTEM },
      {
        role: "user",
        content: `Rewrite each rubric below. Keep question difficulty the same — only simplify rubric clarity.
Return STRICT JSON: { "rubrics": [ { "id": <number>, "rubric": "<new rubric text>" }, ... ] }

${JSON.stringify(payload, null, 2)}`,
      },
    ],
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
  const rubrics = Array.isArray(parsed.rubrics) ? parsed.rubrics : [];
  const map = new Map();
  for (const r of rubrics) {
    if (r && typeof r.id === "number" && typeof r.rubric === "string") {
      map.set(r.id, r.rubric.trim());
    }
  }
  return map;
}

loadEnv();
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY not set in .env.local");
  process.exit(1);
}

const { roleId, dryRun, batchSize } = parseArgs();
const model = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
const openai = new OpenAI({ apiKey });
const store = JSON.parse(readFileSync(storePath, "utf8"));

let targets = store.questions.filter((q) => q.rubric?.trim());
if (roleId != null) targets = targets.filter((q) => q.role_id === roleId);

if (targets.length === 0) {
  console.log("No questions to simplify.");
  process.exit(0);
}

console.log(`Simplifying ${targets.length} rubric(s)${roleId != null ? ` for role_id=${roleId}` : ""}...`);

let updated = 0;
let failed = 0;

for (let i = 0; i < targets.length; i += batchSize) {
  const batch = targets.slice(i, i + batchSize);
  const label = `${i + 1}-${Math.min(i + batchSize, targets.length)}`;
  process.stdout.write(`Batch ${label}... `);
  try {
    const map = await simplifyBatch(openai, model, batch);
    for (const q of batch) {
      const next = map.get(q.id);
      if (!next) {
        failed++;
        console.log(`\n  Warning: no rubric returned for id=${q.id}`);
        continue;
      }
      if (!dryRun) {
        const row = store.questions.find((x) => x.id === q.id);
        if (row) row.rubric = next;
      }
      updated++;
    }
    console.log("ok");
  } catch (err) {
    failed += batch.length;
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`FAILED — ${msg}`);
  }
}

if (!dryRun && updated > 0) {
  writeFileSync(storePath, JSON.stringify(store, null, 2));
}

console.log(
  dryRun
    ? `\nDry run: would update ${updated} rubric(s).`
    : `\nUpdated ${updated} rubric(s) in data/store.json.`
);
if (failed > 0) console.log(`${failed} issue(s).`);
process.exit(failed > 0 ? 1 : 0);
