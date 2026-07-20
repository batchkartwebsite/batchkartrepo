import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-lg font-extrabold tracking-tight", className)}
      aria-label="BatchKart"
    >
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0" role="img" aria-hidden="true">
        <rect width="48" height="48" rx="13" fill="#059669" />
        <path d="M24 14 L37 20 L24 26 L11 20 Z" fill="#fff" />
        <path
          d="M17 22.5 V29 c0 2.2 3.1 4 7 4 s7 -1.8 7 -4 v-6.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M37 20 v6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="37" cy="27.5" r="1.8" fill="#fff" />
      </svg>
      {showWordmark && (
        <span aria-hidden="true">
          Batch<span className="text-primary">Kart</span>
        </span>
      )}
    </span>
  );
}
