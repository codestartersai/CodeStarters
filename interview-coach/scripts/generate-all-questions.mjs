/**
 * Generate interview question kits for every role missing questions.
 * Run: npm run generate-all-questions
 * Requires OPENAI_API_KEY in .env.local
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import {
  QUESTION_GEN_SYSTEM,
  buildQuestionGenUser,
} from "./rubric-constants.mjs";

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

function loadStore() {
  return JSON.parse(readFileSync(storePath, "utf8"));
}

function saveStore(store) {
  writeFileSync(storePath, JSON.stringify(store, null, 2));
}

loadEnv();
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY not set in .env.local");
  process.exit(1);
}

const model = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
const openai = new OpenAI({ apiKey });
const store = loadStore();

const rolesNeedingQuestions = store.roles.filter(
  (r) => !store.questions.some((q) => q.role_id === r.id),
);

if (rolesNeedingQuestions.length === 0) {
  console.log("All roles already have questions.");
  process.exit(0);
}

console.log(`Generating questions for ${rolesNeedingQuestions.length} role(s)...\n`);

let failed = 0;

for (const role of rolesNeedingQuestions) {
  process.stdout.write(`${role.title}... `);
  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: QUESTION_GEN_SYSTEM },
        { role: "user", content: buildQuestionGenUser(role.title, role.description) },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
    const items = Array.isArray(parsed.questions) ? parsed.questions : [];
    const clean = items
      .filter((q) => q && typeof q.question === "string" && q.question.trim())
      .map((q) => ({
        question: q.question.trim(),
        category: (q.category ?? "general").toString().trim() || "general",
        rubric: (q.rubric ?? "").toString().trim(),
      }));

    if (clean.length === 0) throw new Error("model returned no questions");

    store.questions = store.questions.filter((q) => q.role_id !== role.id);
    for (let i = 0; i < clean.length; i++) {
      const q = clean[i];
      store.questions.push({
        id: store.nextId.questions++,
        role_id: role.id,
        question: q.question,
        category: q.category,
        rubric: q.rubric,
        sort_order: i,
        created_at: new Date().toISOString(),
      });
    }
    saveStore(store);
    console.log(`${clean.length} questions`);
  } catch (err) {
    failed++;
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`FAILED — ${msg}`);
  }
}

console.log(failed === 0 ? "\nDone." : `\nFinished with ${failed} failure(s).`);
process.exit(failed > 0 ? 1 : 0);
