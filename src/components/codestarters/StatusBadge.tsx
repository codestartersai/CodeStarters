import { clsx } from "clsx";

type Status = "pending" | "in_progress" | "contacted" | "completed" | "rejected";

interface StatusBadgeProps {
  status: Status | string;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  in_progress: {
    label: "In Progress",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  },
  contacted: {
    label: "Contacted",
    classes: "bg-purple-50 text-purple-700 border-purple-200",
  },
  completed: {
    label: "Completed",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as string] || STATUS_CONFIG.pending;

  return (
    <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-bold border", config.classes)}>
      {config.label}
    </span>
  );
}
