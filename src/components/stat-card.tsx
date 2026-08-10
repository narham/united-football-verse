import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "field" | "energetic" | "win" | "loss" | "muted";
}

const toneStyle: Record<NonNullable<StatCardProps["tone"]>, string> = {
  field: "bg-field/10 text-field",
  energetic: "bg-energetic/20 text-energetic-foreground",
  win: "bg-win/10 text-win",
  loss: "bg-loss/10 text-loss",
  muted: "bg-muted text-muted-foreground",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "field" }: StatCardProps) {
  return (
    <article 
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
      aria-label={`${label}: ${value}${hint ? `. ${hint}` : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground" id={`stat-${label}`}>{label}</p>
          <p className="mt-2 font-display text-3xl leading-none text-foreground" aria-describedby={`stat-${label}`}>{value}</p>
          {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneStyle[tone])} aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}
