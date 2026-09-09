// Shared shapes used by client components (mirror of the DB row types, but
// safe to import from "use client" files since this module has no server deps).

export interface Role {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export interface RoleListItem extends Role {
  question_count: number;
  session_count: number;
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

/** Question merged from one or more roles, tagged for interviewer context. */
export interface QuestionWithRole extends Question {
  role_title: string;
}

export interface Session {
  id: number;
  role_id: number;
  /** All roles for this interview; omitted on legacy single-role sessions. */
  role_ids?: number[];
  interviewee_name: string;
  started_at: string;
  completed_at: string | null;
  /** Holistic end-of-interview score (0–100); preferred over per-question average. */
  overall_score?: number | null;
  hire_recommendation?: string | null;
  holistic_summary?: string | null;
  best_fit_role?: string | null;
  best_fit_role_secondary?: string | null;
  best_fit_rationale?: string | null;
  /** Fingerprint of interviewer notes at last finalize — triggers re-run when notes change. */
  finalized_notes_fingerprint?: string | null;
}

export interface SessionListItem extends Session {
  role_title: string;
  answered: number;
  total_questions: number;
}

export interface LeaderboardEntry {
  rank: number;
  session_id: number;
  interviewee_name: string;
  score: number;
  hire_recommendation: string;
  completed_at: string;
  role_title: string;
  best_fit_role: string | null;
}

export interface FinalizeResult {
  overall_score: number;
  hire_recommendation: string;
  holistic_summary: string;
  best_fit_role: string;
  best_fit_role_secondary: string | null;
  best_fit_rationale: string;
}

export interface Answer {
  id: number;
  session_id: number;
  question_id: number;
  transcript: string;
  score: number | null;
  feedback: string;
  strengths: string; // JSON-encoded string[]
  gaps: string; // JSON-encoded string[]
  interviewer_note: string;
  created_at: string;
}

export interface Grade {
  score: number | null;
  feedback: string;
  strengths: string[];
  gaps: string[];
}
