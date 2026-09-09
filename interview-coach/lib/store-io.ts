import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { get, put } from "@vercel/blob";

export const BLOB_PATHNAME = "interview-coach/store.json";

const isServerless = process.env.VERCEL === "1";
const useBlob = isServerless && Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const DATA_DIR = isServerless
  ? path.join("/tmp", "interview-coach-data")
  : path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const SEED_PATH = path.join(process.cwd(), "data", "store.seed.json");

export interface Store {
  roles: Array<{
    id: number;
    title: string;
    description: string;
    created_at: string;
  }>;
  questions: Array<{
    id: number;
    role_id: number;
    question: string;
    category: string;
    rubric: string;
    sort_order: number;
    created_at: string;
  }>;
  sessions: Array<{
    id: number;
    role_id: number;
    role_ids?: number[];
    interviewee_name: string;
    started_at: string;
    completed_at: string | null;
    overall_score?: number | null;
    hire_recommendation?: string | null;
    holistic_summary?: string | null;
    best_fit_role?: string | null;
    best_fit_role_secondary?: string | null;
    best_fit_rationale?: string | null;
    finalized_notes_fingerprint?: string | null;
  }>;
  answers: Array<{
    id: number;
    session_id: number;
    question_id: number;
    transcript: string;
    score: number | null;
    feedback: string;
    strengths: string;
    gaps: string;
    interviewer_note: string;
    created_at: string;
  }>;
  nextId: { roles: number; questions: number; sessions: number; answers: number };
}

export function emptyStore(): Store {
  return {
    roles: [],
    questions: [],
    sessions: [],
    answers: [],
    nextId: { roles: 1, questions: 1, sessions: 1, answers: 1 },
  };
}

function hydrateFromSeed(store: Store): Store {
  if (!existsSync(SEED_PATH)) return store;
  try {
    const seed = JSON.parse(readFileSync(SEED_PATH, "utf8")) as Store;
    if (store.roles.length === 0 && seed.roles.length > 0) store.roles = seed.roles;
    if (store.questions.length === 0 && seed.questions.length > 0) {
      store.questions = seed.questions;
    }
    for (const key of ["roles", "questions", "sessions", "answers"] as const) {
      if (seed.nextId[key] > store.nextId[key]) store.nextId[key] = seed.nextId[key];
    }
  } catch {
    /* seed optional */
  }
  return store;
}

function readSeedStore(): Store | null {
  if (!existsSync(SEED_PATH)) return null;
  try {
    return hydrateFromSeed(JSON.parse(readFileSync(SEED_PATH, "utf8")) as Store);
  } catch {
    return null;
  }
}

function loadFromFilesystem(): Store | null {
  if (!existsSync(STORE_PATH)) return null;
  try {
    return hydrateFromSeed(JSON.parse(readFileSync(STORE_PATH, "utf8")) as Store);
  } catch {
    return null;
  }
}

function saveToFilesystem(store: Store): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

async function loadFromBlob(): Promise<Store | null> {
  try {
    const result = await get(BLOB_PATHNAME, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    return hydrateFromSeed(JSON.parse(text) as Store);
  } catch (err) {
    console.warn("Failed to load store from Vercel Blob:", err);
    return null;
  }
}

async function saveToBlob(store: Store): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(store), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

/** Load persisted store — always reads from Blob on Vercel for cross-instance consistency. */
export async function loadPersistedStore(): Promise<Store> {
  if (useBlob) {
    const fromBlob = await loadFromBlob();
    if (fromBlob) return fromBlob;

    const seeded = readSeedStore();
    const store = seeded ?? emptyStore();
    await saveToBlob(store);
    return store;
  }

  let store = loadFromFilesystem();
  if (!store) {
    const seeded = readSeedStore();
    store = seeded ?? emptyStore();
    saveToFilesystem(store);
  }
  return store;
}

export async function savePersistedStore(store: Store): Promise<void> {
  if (useBlob) {
    await saveToBlob(store);
    return;
  }
  saveToFilesystem(store);
}

export function isBlobPersistenceEnabled(): boolean {
  return useBlob;
}

export function persistenceWarning(): string | null {
  if (isServerless && !useBlob) {
    return "BLOB_READ_WRITE_TOKEN is not set — interview data will not persist across requests on Vercel.";
  }
  return null;
}
