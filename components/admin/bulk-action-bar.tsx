"use client";

import { Button } from "@/components/ui/button";

type BulkAction = { key: string; label: string; onRun: () => void };

export function BulkActionBar({
  count,
  actions,
  onClear,
}: {
  count: number;
  actions: BulkAction[];
  onClear: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-600/20 bg-emerald-600/5 px-4 py-2.5 dark:border-emerald-500/25 dark:bg-emerald-500/10">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {count} selected
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.key}
            variant="outline"
            size="sm"
            onClick={action.onRun}
          >
            {action.label}
          </Button>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
