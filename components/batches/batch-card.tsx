import Image from "next/image";
import type { Row } from "@/lib/admin/resource-config";
import { logoForInstitute } from "@/lib/institutes";

type BatchRow = Row<"batches">;

const MODE_LABEL: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};

function formatFee(fee: number | null): string {
  return fee != null ? `₹${fee.toLocaleString("en-IN")}` : "On request";
}

/** Initials badge for an institute (fallback avatar). */
function initials(name: string | null): string {
  if (!name) return "BK";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function BatchCard({ batch }: { batch: BatchRow }) {
  const b = batch;
  const logo = logoForInstitute(b.institute_name);
  const hasDiscount = b.discounted_fee != null && b.fee != null && b.discounted_fee < b.fee;
  const off = hasDiscount
    ? Math.round((1 - (b.discounted_fee as number) / (b.fee as number)) * 100)
    : 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_-24px_rgba(5,150,105,0.5)]">
      {/* top row: institute + exam tag */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {logo ? (
            <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-white p-1.5">
              <Image
                src={logo}
                alt={b.institute_name ?? "Institute logo"}
                width={40}
                height={40}
                className="size-full object-contain"
              />
            </span>
          ) : (
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 font-display text-sm font-semibold text-primary">
              {initials(b.institute_name)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {b.institute_name ?? "Independent"}
            </p>
            <p className="text-xs text-muted-foreground">{MODE_LABEL[b.mode] ?? b.mode}</p>
          </div>
        </div>
        {b.exam ? (
          <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            {b.exam}
          </span>
        ) : null}
      </div>

      {/* title */}
      <h3 className="mt-4 text-lg leading-snug font-bold tracking-tight text-foreground">
        {b.name}
      </h3>
      {b.description ? (
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
      ) : null}

      {/* meta chips */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {b.city ? <Chip>📍 {b.city}</Chip> : null}
        {b.teacher ? <Chip>👨‍🏫 {b.teacher}</Chip> : null}
        {b.duration_months ? <Chip>🗓 {b.duration_months} mo</Chip> : null}
        {b.scholarship_available ? <Chip>🎓 Scholarship</Chip> : null}
      </div>

      {/* footer: price + cta */}
      <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
        <div>
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-semibold text-foreground">
                {formatFee(b.discounted_fee)}
              </span>
              <span className="text-sm text-muted-foreground line-through">{formatFee(b.fee)}</span>
            </div>
          ) : (
            <span className="font-display text-xl font-semibold text-foreground">
              {formatFee(b.fee)}
            </span>
          )}
          {off > 0 ? (
            <span className="mt-0.5 block text-xs font-semibold text-primary">{off}% off</span>
          ) : null}
        </div>
        <a
          href="/batches#enquiry"
          className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary"
        >
          Enquire
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </a>
      </div>
    </article>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}
