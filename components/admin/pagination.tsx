"use client";

import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  const total = Math.max(1, pageCount);
  const isFirst = page <= 1;
  const isLast = page >= total;

  return (
    <div className="flex items-center justify-between gap-3">
      <Button
        variant="outline"
        size="sm"
        disabled={isFirst}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        Page {page} of {total}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={isLast}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
