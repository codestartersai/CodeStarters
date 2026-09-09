"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { RoleListItem } from "@/lib/types";
import { apiJson } from "@/lib/client-api";

type Step = 1 | 2 | 3;

const STEPS = [
  { n: 1, label: "Interviewee" },
  { n: 2, label: "Roles" },
  { n: 3, label: "Ready" },
] as const;

export default function OnboardingFlow() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [intervieweeName, setIntervieweeName] = useState("");

  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [mode, setMode] = useState<"pick" | "create">("pick");

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);

  const [generatingRoleId, setGeneratingRoleId] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRoles = useMemo(
    () => roles.filter((r) => selectedRoleIds.includes(r.id)),
    [roles, selectedRoleIds]
  );

  const totalQuestions = useMemo(
    () => selectedRoles.reduce((sum, r) => sum + r.question_count, 0),
    [selectedRoles]
  );

  const rolesNeedingQuestions = useMemo(
    () => selectedRoles.filter((r) => r.question_count === 0),
    [selectedRoles]
  );

  useEffect(() => {
    apiJson<{ roles: RoleListItem[] }>("/api/roles").then((res) => {
      if (res.ok) setRoles(res.data.roles ?? []);
      else setError(res.error);
      setRolesLoading(false);
    });
  }, []);

  useEffect(() => {
    if (step !== 3 || selectedRoleIds.length === 0) return;
    refreshRoles().catch((e) =>
      setError(e instanceof Error ? e.message : "Could not refresh roles.")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedRoleIds]);

  useEffect(() => {
    if (!rolesLoading && roles.length === 0) setMode("create");
  }, [rolesLoading, roles.length]);

  function toggleRole(roleId: number) {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  }

  async function refreshRoles() {
    const res = await apiJson<{ roles: RoleListItem[] }>("/api/roles");
    if (!res.ok) throw new Error(res.error);
    setRoles(res.data.roles ?? []);
    return res.data.roles;
  }

  async function createRole() {
    setCreatingRole(true);
    setError(null);
    try {
      const res = await apiJson<{ role: RoleListItem }>("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });
      if (!res.ok) {
        setError(res.error);
        return null;
      }
      const updated = await refreshRoles();
      setSelectedRoleIds((prev) =>
        prev.includes(res.data.role.id) ? prev : [...prev, res.data.role.id]
      );
      setMode("pick");
      return updated.find((r) => r.id === res.data.role.id) ?? res.data.role;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create role.");
      return null;
    } finally {
      setCreatingRole(false);
    }
  }

  async function goToStep3() {
    setError(null);
    try {
      if (mode === "create") {
        if (!newTitle.trim()) {
          setError("Enter a role title.");
          return;
        }
        const role = await createRole();
        if (!role) return;
      } else if (selectedRoleIds.length === 0) {
        setError("Select at least one role or create a new one.");
        return;
      }
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  async function generateQuestions(roleId: number) {
    setGeneratingRoleId(roleId);
    setError(null);
    try {
      const res = await apiJson<{ questions: unknown[] }>(
        `/api/roles/${roleId}/generate-questions`,
        { method: "POST" }
      );
      if (!res.ok) {
        setError(res.error);
        return;
      }
      await refreshRoles();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Question generation failed.");
    } finally {
      setGeneratingRoleId(null);
    }
  }

  async function startInterview() {
    if (selectedRoleIds.length === 0) return;
    setStarting(true);
    setError(null);
    try {
      const missing = selectedRoles.filter((r) => r.question_count === 0);
      if (missing.length > 0) {
        setError(`Generate questions for: ${missing.map((r) => r.title).join(", ")}`);
        return;
      }

      const res = await apiJson<{ session: { id: number } }>("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds: selectedRoleIds, intervieweeName }),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/interview/${res.data.session.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start interview.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <nav className="mb-10 flex items-center justify-center gap-2">
        {STEPS.map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
                step === n
                  ? "bg-accent-500 text-white"
                  : step > n
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-ink-800 text-slate-500"
              }`}
            >
              {step > n ? "✓" : n}
            </div>
            <span
              className={`text-sm hidden sm:inline ${step === n ? "text-white" : "text-slate-500"}`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 h-px w-8 sm:w-12 ${step > n ? "bg-emerald-500/40" : "bg-ink-700"}`}
              />
            )}
          </div>
        ))}
      </nav>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {step === 1 && (
        <section className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Who are you interviewing?</h1>
            <p className="mt-2 text-sm text-slate-400">
              Who are you interviewing in person? They won&apos;t see this screen.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Interviewee name</label>
            <input
              autoFocus
              value={intervieweeName}
              onChange={(e) => setIntervieweeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && intervieweeName.trim()) setStep(2);
              }}
              placeholder="e.g. Alex Chen"
              className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-lg outline-none focus:border-accent-500"
            />
          </div>
          <button
            onClick={() => {
              if (!intervieweeName.trim()) {
                setError("Enter the interviewee's name.");
                return;
              }
              setError(null);
              setStep(2);
            }}
            className="w-full rounded-xl bg-accent-500 hover:bg-accent-600 transition py-3 text-sm font-medium text-white"
          >
            Continue →
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              What roles is {intervieweeName} interviewing for?
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Select one or more roles. Questions from all selected roles will be combined into one
              interview.
            </p>
          </div>

          <div className="flex gap-2 rounded-lg border border-ink-700 bg-ink-900/50 p-1">
            <button
              onClick={() => setMode("pick")}
              disabled={roles.length === 0}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                mode === "pick" ? "bg-ink-700 text-white" : "text-slate-400 hover:text-slate-200"
              } disabled:opacity-40`}
            >
              Existing roles
            </button>
            <button
              onClick={() => setMode("create")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                mode === "create" ? "bg-ink-700 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create new
            </button>
          </div>

          {mode === "pick" ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {rolesLoading ? (
                <p className="text-sm text-slate-500">Loading roles…</p>
              ) : roles.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No roles yet — switch to &ldquo;Create new&rdquo; to add one.
                </p>
              ) : (
                roles.map((role) => {
                  const selected = selectedRoleIds.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition flex gap-3 ${
                        selected
                          ? "border-accent-500 bg-accent-500/10"
                          : "border-ink-700 bg-ink-900/40 hover:border-ink-600"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                          selected
                            ? "border-accent-500 bg-accent-500 text-white"
                            : "border-ink-600 bg-ink-900"
                        }`}
                      >
                        {selected ? "✓" : ""}
                      </span>
                      <span className="min-w-0 flex-1">
                        <p className="font-medium">{role.title}</p>
                        {role.description && (
                          <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                            {role.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">{role.question_count} questions</p>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role title</label>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Head of AI"
                  className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm outline-none focus:border-accent-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description{" "}
                  <span className="font-normal text-slate-500">(helps generate better questions)</span>
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={5}
                  placeholder="Responsibilities, programs, what success looks like…"
                  className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm outline-none focus:border-accent-500 resize-y"
                />
              </div>
            </div>
          )}

          {selectedRoleIds.length > 0 && mode === "pick" && (
            <p className="text-xs text-slate-500">
              {selectedRoleIds.length} role{selectedRoleIds.length === 1 ? "" : "s"} selected
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setError(null);
                setStep(1);
              }}
              className="rounded-xl border border-ink-600 hover:bg-ink-800 px-5 py-3 text-sm"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => void goToStep3()}
              disabled={creatingRole}
              className="flex-1 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-50 transition py-3 text-sm font-medium text-white"
            >
              {creatingRole ? "Creating…" : "Continue →"}
            </button>
          </div>
        </section>
      )}

      {step === 3 && selectedRoles.length > 0 && (
        <section className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">You&apos;re all set</h1>
            <p className="mt-2 text-sm text-slate-400">
              Review the details, then begin the in-person interview.
            </p>
          </div>

          <div className="rounded-xl border border-ink-700 bg-ink-900/50 divide-y divide-ink-700">
            <div className="px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Interviewee</p>
              <p className="mt-1 font-medium text-lg">{intervieweeName}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Roles</p>
              <ul className="mt-2 space-y-3">
                {selectedRoles.map((role) => (
                  <li key={role.id}>
                    <p className="font-medium">{role.title}</p>
                    {role.description && (
                      <p className="mt-0.5 text-sm text-slate-400 line-clamp-2">{role.description}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        {role.question_count > 0
                          ? `${role.question_count} questions ready`
                          : "Not generated yet"}
                      </p>
                      {role.question_count === 0 ? (
                        <button
                          onClick={() => void generateQuestions(role.id)}
                          disabled={generatingRoleId === role.id}
                          className="rounded-lg border border-ink-600 hover:bg-ink-800 disabled:opacity-50 px-3 py-1.5 text-xs"
                        >
                          {generatingRoleId === role.id ? "Generating…" : "Generate"}
                        </button>
                      ) : (
                        <button
                          onClick={() => void generateQuestions(role.id)}
                          disabled={generatingRoleId === role.id}
                          className="rounded-lg border border-ink-600 hover:bg-ink-800 disabled:opacity-50 px-3 py-1.5 text-xs text-slate-400"
                        >
                          {generatingRoleId === role.id ? "…" : "Regenerate"}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Combined questions</p>
              <p className="mt-1 font-medium">
                {rolesNeedingQuestions.length === 0
                  ? `${totalQuestions} ready across ${selectedRoles.length} role${selectedRoles.length === 1 ? "" : "s"}`
                  : "Generate questions for all roles before starting"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setError(null);
                setStep(2);
              }}
              className="rounded-xl border border-ink-600 hover:bg-ink-800 px-5 py-3 text-sm"
            >
              ← Back
            </button>
            <button
              onClick={() => void startInterview()}
              disabled={starting || rolesNeedingQuestions.length > 0}
              className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 transition py-3 text-sm font-semibold text-white"
            >
              {starting ? "Starting…" : "Start Interview →"}
            </button>
          </div>
        </section>
      )}

      {step === 3 && selectedRoles.length === 0 && selectedRoleIds.length > 0 && (
        <p className="text-sm text-slate-500">Loading roles…</p>
      )}
    </div>
  );
}
