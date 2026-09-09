/**
 * Copy simplified VP rubrics from data/store.json into scripts/apply-vp-ultra-kit.mjs.
 * Run after simplify-rubrics: node scripts/sync-vp-rubrics-to-kit.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, "..", "data", "store.json");
const kitPath = path.join(__dirname, "apply-vp-ultra-kit.mjs");
const VP_ROLE_ID = 2;

const store = JSON.parse(readFileSync(storePath, "utf8"));
const vpQuestions = store.questions
  .filter((q) => q.role_id === VP_ROLE_ID)
  .sort((a, b) => a.sort_order - b.sort_order);

let kit = readFileSync(kitPath, "utf8");
let replaced = 0;

for (const q of vpQuestions) {
  const escaped = q.question.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(question:\\s*\\n\\s*"${escaped}",\\s*\\n\\s*rubric:\\s*\\n\\s*")([^"]*(?:\\\\.[^"]*)*)(")`,
    "s"
  );
  const rubricEscaped = q.rubric.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  const next = kit.replace(pattern, `$1${rubricEscaped}$3`);
  if (next !== kit) {
    replaced++;
    kit = next;
  } else {
    console.warn(`No match for question id=${q.id}`);
  }
}

writeFileSync(kitPath, kit);
console.log(`Synced ${replaced}/${vpQuestions.length} VP rubrics into apply-vp-ultra-kit.mjs`);
