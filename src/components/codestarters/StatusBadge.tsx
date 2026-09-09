import { clsx } from "clsx";

type Status = "pending" | "in_progress" | "contacted" | "completed" | "rejected";

interface StatusBadgeProps {
  status: Status | string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; classes: string }> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    classes: "bg-amber-50 text-amber-800 border-amber-200/80",
  },
  in_progress: {
    label: "In Progress",
    dot: "bg-blue-500",
    classes: "bg-blue-50 text-blue-800 border-blue-200/80",
  },
  contacted: {
    label: "Contacted",
    dot: "bg-purple-500",
    classes: "bg-purple-50 text-purple-800 border-purple-200/80",
  },
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    classes: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-rose-500",
    classes: "bg-rose-50 text-rose-800 border-rose-200/80",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as string] || STATUS_CONFIG.pending;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border select-none shrink-0",
        config.classes,
        className
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      <span>{config.label}</span>
    </span>
  );
}

