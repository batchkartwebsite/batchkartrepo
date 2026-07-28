import type { InputHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/utils";

export function AuthField({
  label,
  error,
  hint,
  ref,
  ...props
}: { label: string; error?: string; hint?: string; ref?: Ref<HTMLInputElement> } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between text-sm font-medium text-foreground">
        {label}
        {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
      </span>
      <input
        ref={ref}
        {...props}
        className={cn(
          "block w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",
          error ? "border-rose-400 dark:border-rose-500" : "border-border",
        )}
      />
      {error ? <span className="block text-xs text-rose-600 dark:text-rose-400">{error}</span> : null}
    </label>
  );
}
