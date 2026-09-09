/**
 * Replace Vice-President (role_id=2) questions with an ultra-rigorous scenario kit.
 * Run: node scripts/update-vp-questions.mjs
 * Requires OPENAI_API_KEY in .env.local
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const storePath = path.join(root, "data", "store.json");
const envPath = path.join(root, ".env.local");
const VP_ROLE_ID = 2;

const QUESTION_GEN_SYSTEM = `You are a brutal executive interviewer for student nonprofit leadership roles.
You design Vice-President interview kits that stress-test operational judgment, crisis leadership, and follow-through under pressure.
Questions must be answerable out loud in 2-4 minutes — candidates speak plans, not write essays.
Rubrics are interviewer-only grading notes; they must be concrete enough to score 0-100 with no inflation.`;

function buildVpQuestionGenUser(description) {
  return `Create an ULTRA-RIGOROUS interview kit for CodeStarters Vice-President (role #2 operator — assists President on ops, partnerships, PR, events, cross-functional coordination).

ORG CONTEXT:
${description}

REQUIREMENTS — FOLLOW EXACTLY:
1. Generate exactly 25 questions (not fewer). Prefer scripts/apply-vp-ultra-kit.mjs for the canonical hand-crafted kit.
2. Categories: ONLY scenario | judgment | leadership — NO behavioral, culture, motivation, or "tell me about yourself" questions.
3. Almost every question must be a specific crisis or high-pressure scenario with named stakeholders, timelines, and tradeoffs.
4. Cover at least 10 of these themes (multiple questions can combine themes):
   - Multi-stakeholder crises (parents + mentors + sponsors at once)
   - Ethical gray areas (student data, AI misuse, favoritism)
   - Public embarrassment (viral post, botched event, media inquiry)
   - President authority conflicts (President unavailable, wrong decision, credit/blame)
   - Budget/time tradeoffs with NO good option (cut bootcamp vs hackathon vs websites)
   - Firing or replacing mentors mid-season (performance, safety, parent pressure)
   - Parent complaints (safety, curriculum, discrimination claims)
   - Media or school district inquiries
   - Sponsor misconduct or sponsor threatening to pull funding
   - Exam week / holiday abandonment (mentors ghost, VP must cover)
   - Scaling beyond capacity (3x signups, mentor burnout)
   - Fire Hacks hackathon disasters (venue, judging scandal, safety)
   - Free business website project failures (missed deadline, angry business owner)
5. Each question MUST demand specifics: who does what, by when, what you say (outline comms), escalation path, numbers where relevant.
6. Rubrics MUST be brutal:
   - MUST-HAVE: 4-5 bullet points (score cannot exceed 55 if ANY missing)
   - STRONG: 2-3 bullets (needed for 70+ — must include named actions + timeline + ownership)
   - EXCELLENT: 1-2 bullets (needed for 85+)
   - RED FLAGS: 3-4 harsh failure modes (cap score at 35 or below)
7. Explicitly note in each rubric: "70+ requires named actions, timeline, and who owns each step — not platitudes."

Return STRICT JSON (no markdown):

{
  "questions": [
    {
      "question": "...",
      "category": "scenario | judgment | leadership",
      "rubric": "MUST-HAVE (score cannot exceed 55 if any missing):\\n- ...\\nSTRONG (needed for 70+; named actions + timeline + ownership):\\n- ...\\nEXCELLENT (needed for 85+):\\n- ...\\nRED FLAGS (cap at 35 or below):\\n- ..."
    }
  ]
}`;
}

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

const model = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o";
const openai = new OpenAI({ apiKey });
const store = loadStore();

const vpRole = store.roles.find((r) => r.id === VP_ROLE_ID);
if (!vpRole) {
  console.error(`Role id=${VP_ROLE_ID} (Vice-President) not found.`);
  process.exit(1);
}

const oldCount = store.questions.filter((q) => q.role_id === VP_ROLE_ID).length;
console.log(`Replacing ${oldCount} VP questions with ultra-rigorous kit...\n`);

const completion = await openai.chat.completions.create({
  model,
  temperature: 0.65,
  response_format: { type: "json_object" },
  messages: [
    { role: "system", content: QUESTION_GEN_SYSTEM },
    { role: "user", content: buildVpQuestionGenUser(vpRole.description) },
  ],
});

const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
const items = Array.isArray(parsed.questions) ? parsed.questions : [];
const clean = items
  .filter((q) => q && typeof q.question === "string" && q.question.trim())
  .map((q) => ({
    question: q.question.trim(),
    category: (q.category ?? "scenario").toString().trim() || "scenario",
    rubric: (q.rubric ?? "").toString().trim(),
  }));

if (clean.length < 16) {
  console.error(`Model returned only ${clean.length} questions (need 16-18). Aborting without save.`);
  process.exit(1);
}

store.questions = store.questions.filter((q) => q.role_id !== VP_ROLE_ID);
for (let i = 0; i < clean.length; i++) {
  const q = clean[i];
  store.questions.push({
    id: store.nextId.questions++,
    role_id: VP_ROLE_ID,
    question: q.question,
    category: q.category,
    rubric: q.rubric,
    sort_order: i,
    created_at: new Date().toISOString(),
  });
}

saveStore(store);
const newCount = store.questions.filter((q) => q.role_id === VP_ROLE_ID).length;
console.log(`Done. VP role now has ${newCount} questions (was ${oldCount}).`);
console.log(`Categories: ${[...new Set(clean.map((q) => q.category))].join(", ")}`);
