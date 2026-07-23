import { cn } from "@/lib/utils";

type ModerationStatus = "draft" | "pending" | "published" | "rejected";

const STYLES: Record<ModerationStatus, string> = {
  draft:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  published:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  rejected:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
};

export function ModerationPill({ status }: { status: ModerationStatus }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STYLES[status],
      )}
    >
      {label}
    </span>
  );
}
