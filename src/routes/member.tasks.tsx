import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/browser";
import {
  Loader2,
  Calendar,
  Flag,
  GripVertical,
  CheckCircle2,
  Circle,
  Clock4,
  LogIn,
  KanbanSquare,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/member/tasks")({
  head: () => ({
    meta: [{ title: "Tasks — CodeStarters" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: MemberTasksPage,
});

type Status = "todo" | "in_progress" | "done";
type Priority = "low" | "medium" | "high";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: Status;
  priority: Priority;
  assigned_to?: string[] | null;
  due_date?: string | null;
  created_at: string;
};

const COLUMNS: { id: Status; label: string; icon: React.ElementType; accent: string; dropHint: string }[] = [
  { id: "todo", label: "To Do", icon: Circle, accent: "text-slate-400", dropHint: "Move here to queue" },
  { id: "in_progress", label: "In Progress", icon: Clock4, accent: "text-amber-500", dropHint: "Move here to start" },
  { id: "done", label: "Done", icon: CheckCircle2, accent: "text-emerald-500", dropHint: "Move here to complete" },
];

const PRIORITY_META: Record<Priority, { label: string; cls: string }> = {
  low: { label: "Low", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  medium: { label: "Medium", cls: "bg-amber-50 text-amber-700 border-amber-100" },
  high: { label: "High", cls: "bg-red-50 text-red-700 border-red-100" },
};

const AVATAR_PALETTE = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
  "bg-indigo-100 text-indigo-700",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function AvatarStack({ names, max = 4 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - max;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-1.5">
        {shown.map((n) => (
          <div
            key={n}
            title={n}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black uppercase ring-2 ring-white shrink-0 ${avatarColor(n)}`}
          >
            {n.charAt(0)}
          </div>
        ))}
      </div>
      {rest > 0 && <span className="text-[10px] font-bold text-slate-400">+{rest}</span>}
      {names.length === 1 && (
        <span className="text-xs text-slate-500 font-medium truncate max-w-[100px]">{names[0]}</span>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(due: string) {
  return new Date(due) < new Date(new Date().toDateString());
}

function TaskCard({ task, onDragStart }: { task: Task; onDragStart: (id: string) => void }) {
  const p = PRIORITY_META[task.priority];
  const overdue = task.due_date && task.status !== "done" && isOverdue(task.due_date);
  const assignees = task.assigned_to ?? [];

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(task.id);
      }}
      className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none active:opacity-60 active:scale-95"
    >
      <div className="flex items-start gap-2 mb-3">
        <GripVertical className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
        <p className="text-sm font-bold text-slate-900 leading-snug flex-1">{task.title}</p>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 leading-relaxed mb-3 ml-6 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="ml-6 flex flex-wrap gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${p.cls}`}
        >
          <Flag className="w-2.5 h-2.5" />
          {p.label}
        </span>

        {task.due_date && (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${overdue ? "bg-red-50 text-red-700 border-red-100" : "bg-slate-50 text-slate-500 border-slate-100"}`}
          >
            <Calendar className="w-2.5 h-2.5" />
            {formatDate(task.due_date)}
            {overdue && " · Overdue"}
          </span>
        )}
      </div>

      <div className="ml-6">
        {assignees.length > 0 ? (
          <AvatarStack names={assignees} />
        ) : (
          <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
            <Users className="w-3 h-3" /> Unassigned
          </span>
        )}
      </div>
    </div>
  );
}

function Column({
  column,
  tasks,
  onDragStart,
  onDrop,
}: {
  column: (typeof COLUMNS)[number];
  tasks: Task[];
  onDragStart: (id: string) => void;
  onDrop: (status: Status) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const Icon = column.icon;

  return (
    <div
      className="flex flex-col min-w-0"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onDrop(column.id);
      }}
    >
      <div className="flex items-center gap-2 mb-4 px-1">
        <Icon className={`w-4 h-4 ${column.accent}`} />
        <h3 className="font-black text-slate-800 tracking-tight">{column.label}</h3>
        <span className="ml-auto text-xs font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        className={`flex-1 min-h-[200px] rounded-[1.5rem] p-3 space-y-3 transition-all duration-150 ${
          dragOver
            ? "bg-brand-50 border-2 border-dashed border-brand-400 scale-[1.01]"
            : "bg-slate-100/60 border-2 border-transparent"
        }`}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDragStart={onDragStart} />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 gap-1">
            <p className="text-xs text-slate-400 font-medium">
              {dragOver ? "Drop to move here" : column.dropHint}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberTasksPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthed(!!user);
      if (!user) {
        setLoading(false);
        return;
      }
      const res = await fetch("/api/member/tasks");
      const data = await res.json().catch(() => null);
      if (res.ok) setTasks(Array.isArray(data) ? (data as Task[]) : []);
      setLoading(false);
    };
    void check();
  }, []);

  const handleDrop = async (targetStatus: Status) => {
    const id = dragId.current;
    dragId.current = null;
    if (!id) return;
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === targetStatus) return;

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: targetStatus } : t)));
    await fetch("/api/member/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: targetStatus }),
    });
  };

  if (loading || authed === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center max-w-sm w-full">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <KanbanSquare className="w-7 h-7 text-brand-500" />
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2">Team Tasks</h1>
          <p className="text-slate-500 text-sm mb-6">Sign in to view and update team tasks.</p>
          <Link
            to="/member/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 transition-colors"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </Link>
        </div>
      </div>
    );
  }

  const byStatus = (s: Status) => tasks.filter((t) => t.status === s);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
              <span className="text-brand-700 font-black text-sm">CS</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-none">Team Tasks</h1>
              <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mt-1">
                CodeStarters · Drag cards to update status
              </p>
            </div>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full">
            <GripVertical className="w-3 h-3" /> Drag to move
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              column={col}
              tasks={byStatus(col.id)}
              onDragStart={(id) => (dragId.current = id)}
              onDrop={(status) => void handleDrop(status)}
            />
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-16 bg-white rounded-[2.5rem] border border-slate-100">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-medium text-sm">No tasks yet — check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
