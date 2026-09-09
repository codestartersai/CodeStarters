/**
 * Seeds all open CodeStarters website roles into data/store.json.
 * Run: npm run seed-roles
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const storePath = path.join(root, "data", "store.json");

const ORG_CONTEXT = `CodeStarters is a student-led nonprofit in Cupertino that teaches CS and AI to younger students and builds free websites for local businesses. Programs include: CS & AI Education (intro AI, AI literacy & safety, web basics), AI Development & Agent Engineering (OpenClaw + Hermes, agent workflows + OpenCode), summer bootcamps, Fire Hacks hackathon, and free websites for Cupertino businesses.`;

const ROLES = [
  {
    title: "Vice-President",
    description: `${ORG_CONTEXT}\n\nROLE: Vice-President (Leadership)\nRESPONSIBILITIES: Assists the President with overseeing operations, partnerships, public relations, event coordination, and keeping the org professional and on-track.\nEXPECTATIONS: Strong organizational skills, reliable follow-through, comfortable representing CodeStarters to partners and the community, able to coordinate across CS, AI, marketing, and events teams.`,
  },
  {
    title: "Head of Marketing",
    description: `${ORG_CONTEXT}\n\nROLE: Head of Marketing (Leadership)\nRESPONSIBILITIES: Oversees all marketing and social media. The primary person (besides VPs and President) with access to CodeStarters accounts.\nEXPECTATIONS: Owns brand voice across platforms, promotes bootcamps and Fire Hacks, coordinates marketing team members, plans campaigns that reach students, parents, and local businesses.`,
  },
  {
    title: "Head of CS",
    description: `${ORG_CONTEXT}\n\nROLE: Head of CS (Leadership)\nRESPONSIBILITIES: Ensures all CS bootcamps have lesson plans ready and helps CS mentors prepare for sessions.\nEXPECTATIONS: Oversees Basic CS and Advanced CS mentor tracks; maintains curriculum quality; supports mentors before sessions; keeps year-round CS education on schedule.`,
  },
  {
    title: "Head of AI",
    description: `${ORG_CONTEXT}\n\nROLE: Head of AI (Leadership)\nRESPONSIBILITIES: Keeps AI bootcamps on track, oversees small business website projects, and supports AI mentors.\nEXPECTATIONS: Owns AI Development & Agent Engineering curriculum (agents, OpenClaw/Hermes, OpenCode workflows, responsible AI use); coordinates summer AI bootcamp; mentors AI mentors; helps scope student-built business websites.`,
  },
  {
    title: "AI Mentor",
    description: `${ORG_CONTEXT}\n\nROLE: AI Mentor\nRESPONSIBILITIES: Creates AI lesson plans, leads bootcamp sessions, and helps build websites for local Cupertino businesses.\nEXPECTATIONS: Can teach AI literacy, prompting, and agent workflows to students; runs hands-on sessions; collaborates on free business website projects; explains responsible AI use in age-appropriate ways.`,
  },
  {
    title: "Advanced CS Mentor",
    description: `${ORG_CONTEXT}\n\nROLE: Advanced CS Mentor\nRESPONSIBILITIES: Creates lesson plans and leads Advanced CS bootcamps, teaching algorithms and advanced problem-solving.\nEXPECTATIONS: Strong CS fundamentals; designs challenging but approachable lessons for motivated students; leads sessions with clear explanations and practice problems; supports students beyond intro level.`,
  },
  {
    title: "Basic CS Mentor",
    description: `${ORG_CONTEXT}\n\nROLE: Basic CS Mentor\nRESPONSIBILITIES: Creates lesson plans and runs Basic CS bootcamps, introducing younger students to foundational coding concepts.\nEXPECTATIONS: Patient teaching style for beginners; breaks down concepts simply; runs engaging hands-on activities; helps students who may be new to programming feel confident.`,
  },
  {
    title: "Marketing Team Member",
    description: `${ORG_CONTEXT}\n\nROLE: Marketing Team Member\nRESPONSIBILITIES: Manages social media accounts and posts, draws attention to hackathons, and advertises CodeStarters programs to the community.\nEXPECTATIONS: Creates consistent posts, helps promote Fire Hacks and bootcamps, understands CodeStarters mission, works with Head of Marketing on campaigns, engages students and local community online.`,
  },
];

function emptyStore() {
  return {
    roles: [],
    questions: [],
    sessions: [],
    answers: [],
    nextId: { roles: 1, questions: 1, sessions: 1, answers: 1 },
  };
}

function loadStore() {
  const dataDir = path.join(root, "data");
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  if (!existsSync(storePath)) {
    const s = emptyStore();
    writeFileSync(storePath, JSON.stringify(s, null, 2));
    return s;
  }
  return JSON.parse(readFileSync(storePath, "utf8"));
}

const store = loadStore();

// Drop placeholder roles that aren't on the website.
const canonical = new Set(ROLES.map((r) => r.title.trim().toLowerCase()));
const before = store.roles.length;
store.roles = store.roles.filter((r) => canonical.has(r.title.trim().toLowerCase()));
if (store.roles.length < before) {
  const keptIds = new Set(store.roles.map((r) => r.id));
  store.questions = store.questions.filter((q) => keptIds.has(q.role_id));
  const keptSessionIds = new Set(
    store.sessions.filter((s) => keptIds.has(s.role_id)).map((s) => s.id),
  );
  store.sessions = store.sessions.filter((s) => keptIds.has(s.role_id));
  store.answers = store.answers.filter((a) => keptSessionIds.has(a.session_id));
}

const existing = new Set(store.roles.map((r) => r.title.trim().toLowerCase()));
const created = [];
const skipped = [];

for (const seed of ROLES) {
  const key = seed.title.trim().toLowerCase();
  if (existing.has(key)) {
    skipped.push(seed.title);
    continue;
  }
  store.roles.push({
    id: store.nextId.roles++,
    title: seed.title,
    description: seed.description,
    created_at: new Date().toISOString(),
  });
  existing.add(key);
  created.push(seed.title);
}

writeFileSync(storePath, JSON.stringify(store, null, 2));

console.log(`Created ${created.length} role(s): ${created.join(", ") || "(none)"}`);
console.log(`Skipped ${skipped.length} existing role(s): ${skipped.join(", ") || "(none)"}`);
