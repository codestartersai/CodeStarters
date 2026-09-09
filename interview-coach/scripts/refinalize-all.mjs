/**
 * Wrapper — runs refinalize-all.ts via tsx (direct store access, no dev server).
 * See refinalize-all.ts for flags: --dry-run, --url, --include-incomplete, --no-force
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(__dirname, "refinalize-all.ts");
const args = process.argv.slice(2);

const result = spawnSync("npx", ["tsx", script, ...args], {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."),
  env: process.env,
});

process.exit(result.status ?? 1);
