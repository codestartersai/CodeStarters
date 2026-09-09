import { CODESTARTERS_ROLES } from "./codestarters-roles";
import { answeredAnswers, hireBand } from "./scoring";
import { loadPersistedStore, persistenceWarning, savePersistedStore, type Store } from "./store-io";

export interface Role {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export interface Question {
  id: number;
  role_id: number;
  question: string;
  category: string;
  rubric: string;
  sort_order: number;
  created_at: string;
}

export interface Session {
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
}

export interface QuestionWithRole extends Question {
  role_title: string;
}

export interface Answer {
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
}

async function withStore<T>(fn: (store: Store) => T): Promise<T> {
  const store = await loadPersistedStore();
  const result = fn(store);
  await savePersistedStore(store);
  return result;
}

async function readOnly<T>(fn: (store: Store) => T): Promise<T> {
  const store = await loadPersistedStore();
  return fn(store);
}

function now(): string {
  return new Date().toISOString();
}

/** Role ids for a session — supports legacy rows with only role_id. */
export function getSessionRoleIds(session: Session): number[] {
  if (session.role_ids && session.role_ids.length > 0) return session.role_ids;
  return [session.role_id];
}

function sessionIncludesRole(session: Session, roleId: number): boolean {
  return getSessionRoleIds(session).includes(roleId);
}

export { persistenceWarning };

// ---- Roles --------------------------------------------------------------

export async function listRoles(): Promise<
  (Role & { question_count: number; session_count: number })[]
> {
  return readOnly((store) =>
    [...store.roles]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((r) => ({
        ...r,
        question_count: store.questions.filter((q) => q.role_id === r.id).length,
        session_count: store.sessions.filter((s) => sessionIncludesRole(s, r.id)).length,
      }))
  );
}

export async function getRole(id: number): Promise<Role | undefined> {
  return readOnly((store) => store.roles.find((r) => r.id === id));
}

export async function createRole(title: string, description: string): Promise<Role> {
  return withStore((store) => {
    const role: Role = {
      id: store.nextId.roles++,
      title,
      description,
      created_at: now(),
    };
    store.roles.push(role);
    return role;
  });
}

export async function deleteRole(id: number): Promise<void> {
  await withStore((store) => {
    store.roles = store.roles.filter((r) => r.id !== id);
    store.questions = store.questions.filter((q) => q.role_id !== id);
    const sessionIds = new Set(
      store.sessions.filter((s) => sessionIncludesRole(s, id)).map((s) => s.id)
    );
    store.sessions = store.sessions.filter((s) => !sessionIncludesRole(s, id));
    store.answers = store.answers.filter((a) => !sessionIds.has(a.session_id));
  });
}

/** Idempotently add all open CodeStarters website roles. Skips titles already present. */
export async function seedCodestartersRoles(): Promise<{ created: string[]; skipped: string[] }> {
  return withStore((store) => {
    const existing = new Set(store.roles.map((r) => r.title.trim().toLowerCase()));
    const created: string[] = [];
    const skipped: string[] = [];

    for (const seed of CODESTARTERS_ROLES) {
      const key = seed.title.trim().toLowerCase();
      if (existing.has(key)) {
        skipped.push(seed.title);
        continue;
      }
      store.roles.push({
        id: store.nextId.roles++,
        title: seed.title,
        description: seed.description,
        created_at: now(),
      });
      existing.add(key);
      created.push(seed.title);
    }

    return { created, skipped };
  });
}

// ---- Questions ----------------------------------------------------------

export async function getQuestions(roleId: number): Promise<Question[]> {
  return readOnly((store) =>
    store.questions
      .filter((q) => q.role_id === roleId)
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
  );
}

export async function getSessionRoles(sessionId: number): Promise<Role[]> {
  return readOnly((store) => {
    const session = store.sessions.find((s) => s.id === sessionId);
    if (!session) return [];
    return getSessionRoleIds(session)
      .map((id) => store.roles.find((r) => r.id === id))
      .filter((r): r is Role => r !== undefined);
  });
}

/** Merge questions from multiple roles; dedupe identical question text. */
export async function getQuestionsForRoles(roleIds: number[]): Promise<QuestionWithRole[]> {
  return readOnly((store) => {
    const roleById = new Map(store.roles.map((r) => [r.id, r.title]));
    const seen = new Set<string>();
    const merged: QuestionWithRole[] = [];

    for (const roleId of roleIds) {
      const qs = store.questions
        .filter((q) => q.role_id === roleId)
        .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
      for (const q of qs) {
        const key = q.question.trim().toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push({
          ...q,
          role_title: roleById.get(roleId) ?? "Unknown",
        });
      }
    }
    return merged;
  });
}

export async function getQuestion(id: number): Promise<Question | undefined> {
  return readOnly((store) => store.questions.find((q) => q.id === id));
}

export async function replaceQuestions(
  roleId: number,
  items: { question: string; category: string; rubric: string }[]
): Promise<Question[]> {
  return withStore((store) => {
    store.questions = store.questions.filter((q) => q.role_id !== roleId);
    const created: Question[] = items.map((q, i) => {
      const row: Question = {
        id: store.nextId.questions++,
        role_id: roleId,
        question: q.question,
        category: q.category,
        rubric: q.rubric,
        sort_order: i,
        created_at: now(),
      };
      store.questions.push(row);
      return row;
    });
    return created;
  });
}

// ---- Sessions -----------------------------------------------------------

export async function createSession(roleIds: number[], intervieweeName: string): Promise<Session> {
  const ids = [...new Set(roleIds)].filter((id) => id > 0);
  if (ids.length === 0) throw new Error("At least one role is required.");
  return withStore((store) => {
    const session: Session = {
      id: store.nextId.sessions++,
      role_id: ids[0],
      role_ids: ids,
      interviewee_name: intervieweeName,
      started_at: now(),
      completed_at: null,
    };
    store.sessions.push(session);
    return session;
  });
}

export async function getSession(id: number): Promise<Session | undefined> {
  return readOnly((store) => store.sessions.find((s) => s.id === id));
}

export async function completeSession(id: number): Promise<Session | undefined> {
  return withStore((store) => {
    const session = store.sessions.find((s) => s.id === id);
    if (session && !session.completed_at) session.completed_at = now();
    return session;
  });
}

export async function saveSessionHolistic(
  id: number,
  data: {
    overall_score: number;
    hire_recommendation: string;
    holistic_summary: string;
    best_fit_role: string;
    best_fit_role_secondary?: string | null;
    best_fit_rationale: string;
    finalized_notes_fingerprint?: string | null;
  }
): Promise<Session | undefined> {
  return withStore((store) => {
    const session = store.sessions.find((s) => s.id === id);
    if (!session) return undefined;
    session.overall_score = data.overall_score;
    session.hire_recommendation = data.hire_recommendation;
    session.holistic_summary = data.holistic_summary;
    session.best_fit_role = data.best_fit_role;
    session.best_fit_role_secondary = data.best_fit_role_secondary ?? null;
    session.best_fit_rationale = data.best_fit_rationale;
    session.finalized_notes_fingerprint = data.finalized_notes_fingerprint ?? null;
    if (!session.completed_at) session.completed_at = now();
    return session;
  });
}

function sessionQuestionCount(store: Store, session: Session): number {
  const seen = new Set<string>();
  let count = 0;
  for (const roleId of getSessionRoleIds(session)) {
    for (const q of store.questions.filter((q) => q.role_id === roleId)) {
      const key = q.question.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      count++;
    }
  }
  return count;
}

export async function listSessions(): Promise<
  (Session & {
    role_title: string;
    answered: number;
    total_questions: number;
  })[]
> {
  return readOnly((store) => {
    const roleById = new Map(store.roles.map((r) => [r.id, r.title]));
    return [...store.sessions]
      .sort((a, b) => b.started_at.localeCompare(a.started_at))
      .map((s) => {
        const sessionAnswers = store.answers.filter((a) => a.session_id === s.id);
        return {
          ...s,
          role_title: getSessionRoleIds(s)
            .map((id) => roleById.get(id) ?? "Unknown")
            .join(" + "),
          answered: answeredAnswers(sessionAnswers).length,
          total_questions: sessionQuestionCount(store, s),
        };
      });
  });
}

export interface LeaderboardRow {
  rank: number;
  session_id: number;
  interviewee_name: string;
  score: number;
  hire_recommendation: string;
  completed_at: string;
  role_title: string;
  best_fit_role: string | null;
  role_ids: number[];
}

export async function listLeaderboard(roleId?: number): Promise<LeaderboardRow[]> {
  return readOnly((store) => {
    const roleById = new Map(store.roles.map((r) => [r.id, r.title]));

    const rows = store.sessions
      .filter((s) => s.completed_at != null)
      .filter((s) => {
        if (roleId == null || roleId <= 0) return true;
        return sessionIncludesRole(s, roleId);
      })
      .map((s) => {
        const sessionAnswers = store.answers.filter((a) => a.session_id === s.id);
        const answered = answeredAnswers(sessionAnswers);
        const fallbackAvg =
          answered.length > 0
            ? answered.reduce((sum, a) => sum + (a.score ?? 0), 0) / answered.length
            : null;
        const score =
          s.overall_score != null && Number.isFinite(s.overall_score)
            ? Math.round(s.overall_score)
            : fallbackAvg != null
              ? Math.round(fallbackAvg)
              : null;
        const rec =
          s.hire_recommendation?.trim() ||
          (score != null ? hireBand(score).label : "Not enough data");

        return {
          session_id: s.id,
          interviewee_name: s.interviewee_name || "Unnamed",
          score,
          hire_recommendation: rec,
          completed_at: s.completed_at!,
          role_title: getSessionRoleIds(s)
            .map((id) => roleById.get(id) ?? "Unknown")
            .join(" + "),
          best_fit_role: s.best_fit_role ?? null,
          role_ids: getSessionRoleIds(s),
        };
      })
      .filter((r): r is Omit<LeaderboardRow, "rank"> & { score: number } => r.score != null)
      .sort((a, b) => b.score - a.score || b.completed_at.localeCompare(a.completed_at));

    return rows.map((r, i) => ({ ...r, rank: i + 1 }));
  });
}

// ---- Answers ------------------------------------------------------------

export async function getAnswers(sessionId: number): Promise<Answer[]> {
  return readOnly((store) =>
    store.answers.filter((a) => a.session_id === sessionId).sort((a, b) => a.id - b.id)
  );
}

export async function upsertAnswer(input: {
  sessionId: number;
  questionId: number;
  transcript: string;
  score: number | null;
  feedback: string;
  strengths: string[];
  gaps: string[];
}): Promise<Answer> {
  return withStore((store) => {
    const existing = store.answers.find(
      (a) => a.session_id === input.sessionId && a.question_id === input.questionId
    );
    if (existing) {
      existing.transcript = input.transcript;
      existing.score = input.score;
      existing.feedback = input.feedback;
      existing.strengths = JSON.stringify(input.strengths ?? []);
      existing.gaps = JSON.stringify(input.gaps ?? []);
      return existing;
    }
    const row: Answer = {
      id: store.nextId.answers++,
      session_id: input.sessionId,
      question_id: input.questionId,
      transcript: input.transcript,
      score: input.score,
      feedback: input.feedback,
      strengths: JSON.stringify(input.strengths ?? []),
      gaps: JSON.stringify(input.gaps ?? []),
      interviewer_note: "",
      created_at: now(),
    };
    store.answers.push(row);
    return row;
  });
}

export async function saveInterviewerNote(
  sessionId: number,
  questionId: number,
  note: string
): Promise<void> {
  await withStore((store) => {
    const existing = store.answers.find(
      (a) => a.session_id === sessionId && a.question_id === questionId
    );
    if (existing) {
      existing.interviewer_note = note;
      return;
    }
    store.answers.push({
      id: store.nextId.answers++,
      session_id: sessionId,
      question_id: questionId,
      transcript: "",
      score: null,
      feedback: "",
      strengths: "[]",
      gaps: "[]",
      interviewer_note: note,
      created_at: now(),
    });
  });
}
