/**
 * Re-run holistic assessment for a session (incorporates interviewer notes).
 *
 * Local:  node scripts/finalize-session.mjs 1
 *         node scripts/finalize-session.mjs --name "Shaurya" --force
 * Remote: node scripts/finalize-session.mjs 1 --url https://your-app.vercel.app --force
 */
const args = process.argv.slice(2);

function parseArgs(argv) {
  let sessionId = null;
  let name = null;
  let baseUrl = process.env.FINALIZE_URL ?? "http://localhost:3000";
  let force = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") force = true;
    else if (a === "--url") baseUrl = argv[++i] ?? baseUrl;
    else if (a === "--name") name = argv[++i] ?? null;
    else if (/^\d+$/.test(a)) sessionId = Number(a);
  }

  return { sessionId, name, baseUrl, force };
}

async function resolveSessionId(baseUrl, { sessionId, name }) {
  if (sessionId) return sessionId;

  const res = await fetch(`${baseUrl}/api/sessions`);
  if (!res.ok) throw new Error(`Could not list sessions (${res.status})`);
  const sessions = await res.json();
  const list = Array.isArray(sessions) ? sessions : sessions.sessions ?? [];

  if (name) {
    const match = list.find(
      (s) =>
        String(s.interviewee_name ?? "")
          .toLowerCase()
          .includes(name.toLowerCase())
    );
    if (!match) throw new Error(`No session matching name "${name}"`);
    return match.id;
  }

  const sorted = [...list].sort((a, b) => {
    const ta = new Date(a.completed_at ?? a.started_at).getTime();
    const tb = new Date(b.completed_at ?? b.started_at).getTime();
    return tb - ta;
  });
  const latest = sorted[0];
  if (!latest) throw new Error("No sessions found.");
  return latest.id;
}

async function main() {
  const opts = parseArgs(args);
  const sessionId = await resolveSessionId(opts.baseUrl, opts);
  const url = `${opts.baseUrl}/api/sessions/${sessionId}/finalize${opts.force ? "?force=true" : ""}`;

  console.log(`POST ${url}`);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ force: opts.force }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(data.error ?? data);
    process.exit(1);
  }

  const s = data.session;
  const r = data.result;
  console.log(JSON.stringify({ cached: data.cached, sessionId, ...r, interviewee_name: s?.interviewee_name }, null, 2));
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
