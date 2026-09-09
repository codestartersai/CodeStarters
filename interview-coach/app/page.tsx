"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/client-api";
import { effectiveOverallScore } from "@/lib/scoring";
import type { RoleListItem, SessionListItem } from "@/lib/types";

export default function Dashboard() {
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [rolesRes, sessionsRes] = await Promise.all([
        apiJson<{ roles: RoleListItem[] }>("/api/roles"),
        apiJson<{ sessions: SessionListItem[] }>("/api/sessions"),
      ]);
      if (!rolesRes.ok) setError(rolesRes.error);
      else setRoles(rolesRes.data.roles ?? []);
      if (sessionsRes.ok) setSessions(sessionsRes.data.sessions ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-12">
      {/* Primary CTA — onboarding */}
      <section className="rounded-2xl border border-ink-700 bg-ink-900/40 p-8">
        <h1 className="text-2xl font-semibold tracking-tight">New in-person interview</h1>
        <p className="mt-2 max-w-lg text-sm text-slate-400">
          Enter their name, pick the role(s), then run the interview face-to-face.
        </p>
        <Link
          href="/start"
          className="mt-5 inline-flex rounded-xl bg-accent-500 hover:bg-accent-600 transition px-6 py-3 text-sm font-semibold text-white"
        >
          New Interview →
        </Link>
      </section>

      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Saved roles</h2>
            <p className="text-sm text-slate-400 mt-1">
              Reuse roles across interviews or manage question kits.
            </p>
          </div>
          <Link
            href="/roles/new"
            className="rounded-lg border border-ink-600 hover:bg-ink-800 transition px-4 py-2 text-sm"
          >
            + Add Role
          </Link>
        </div>

        {error ? (
          <p className="text-rose-400 text-sm">{error}</p>
        ) : loading ? (
          <p className="text-slate-500 text-sm">Loading…</p>
        ) : roles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-600 p-10 text-center">
            <p className="text-slate-400">No roles yet.</p>
            <Link href="/start" className="text-accent-400 hover:underline text-sm">
              Start your first interview →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Link
                key={role.id}
                href={`/roles/${role.id}`}
                className="group rounded-xl border border-ink-700 bg-ink-900/50 p-5 hover:border-accent-500/60 transition"
              >
                <h3 className="font-medium group-hover:text-accent-400 transition">{role.title}</h3>
                {role.description && (
                  <p className="mt-1 text-sm text-slate-400 line-clamp-2">{role.description}</p>
                )}
                <div className="mt-4 flex gap-4 text-xs text-slate-500">
                  <span>{role.question_count} questions</span>
                  <span>{role.session_count} interviews</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">Recent interviews</h2>
          <Link href="/leaderboard" className="text-sm text-slate-400 hover:text-slate-200">
            Compare candidates
          </Link>
        </div>
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-500">No interviews recorded yet.</p>
        ) : (
          <div className="rounded-xl border border-ink-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-800 text-slate-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Interviewee</th>
                  <th className="text-left px-4 py-2 font-medium">Roles</th>
                  <th className="text-left px-4 py-2 font-medium">Answered</th>
                  <th className="text-left px-4 py-2 font-medium hidden lg:table-cell">Score</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t border-ink-800">
                    <td className="px-4 py-2">{s.interviewee_name || "Unnamed"}</td>
                    <td className="px-4 py-2 text-slate-400">{s.role_title}</td>
                    <td className="px-4 py-2 text-slate-400">
                      {s.answered}
                      {s.total_questions ? ` / ${s.total_questions}` : ""}
                    </td>
                    <td className="px-4 py-2 text-slate-400 hidden lg:table-cell">
                      {effectiveOverallScore(s) ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      {s.completed_at ? (
                        <span className="text-emerald-400">Complete</span>
                      ) : (
                        <span className="text-amber-400">In progress</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={
                          s.completed_at ? `/summary/${s.id}` : `/interview/${s.id}`
                        }
                        className="text-accent-400 hover:underline"
                      >
                        {s.completed_at ? "View summary" : "Resume"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
