"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/client-api";
import { hireBand } from "@/lib/scoring";
import type { LeaderboardEntry, RoleListItem } from "@/lib/types";

interface LeaderboardPayload {
  roles: RoleListItem[];
  entries: LeaderboardEntry[];
  roleId: number | null;
}

export default function LeaderboardPage() {
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const url =
        roleFilter === "all" ? "/api/leaderboard" : `/api/leaderboard?roleId=${roleFilter}`;
      const res = await apiJson<LeaderboardPayload>(url);
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setRoles(res.data.roles ?? []);
      setEntries(res.data.entries ?? []);
      setLoading(false);
    })();
  }, [roleFilter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">
            ← Back
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Compare candidates</h1>
          <p className="mt-1 text-sm text-slate-400">
            Completed in-person interviews, ranked by score.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="role-filter" className="text-xs uppercase tracking-wide text-slate-500">
            Role
          </label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm outline-none focus:border-accent-500"
          >
            <option value="all">All roles</option>
            {roles.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-500">Loading leaderboard…</p>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-600 p-10 text-center">
          <p className="text-slate-400">No completed interviews with scores yet.</p>
          <Link href="/start" className="mt-2 inline-block text-accent-400 hover:underline text-sm">
            Start an interview →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-ink-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-800 text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2 font-medium w-14">Rank</th>
                <th className="text-left px-4 py-2 font-medium">Interviewee</th>
                <th className="text-left px-4 py-2 font-medium">Score</th>
                <th className="text-left px-4 py-2 font-medium">Recommendation</th>
                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Best fit</th>
                <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Date</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const rec = hireBand(e.score);
                return (
                  <tr key={e.session_id} className="border-t border-ink-800">
                    <td className="px-4 py-2 tabular-nums text-slate-400">#{e.rank}</td>
                    <td className="px-4 py-2 font-medium">{e.interviewee_name}</td>
                    <td className="px-4 py-2 tabular-nums">{e.score}</td>
                    <td className={`px-4 py-2 ${rec.color}`}>
                      {e.hire_recommendation || rec.label}
                    </td>
                    <td className="px-4 py-2 text-slate-400 hidden md:table-cell">
                      {e.best_fit_role ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-500 hidden sm:table-cell">
                      {new Date(e.completed_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/summary/${e.session_id}`}
                        className="text-accent-400 hover:underline"
                      >
                        Summary
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
