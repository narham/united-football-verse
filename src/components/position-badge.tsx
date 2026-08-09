import { cn } from "@/lib/utils";
import type { Position, PlayerStatus } from "@/lib/demo-data";

const posisiStyle: Record<Position, string> = {
  GK: "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/30",
  DF: "bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-blue-500/30",
  MF: "bg-field/15 text-field ring-field/30",
  FW: "bg-energetic/25 text-energetic-foreground ring-energetic/40",
};

export function PositionBadge({ posisi, className }: { posisi: Position; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-bold uppercase tracking-wide ring-1",
        posisiStyle[posisi],
        className,
      )}
    >
      {posisi}
    </span>
  );
}

const statusStyle: Record<PlayerStatus, string> = {
  Aktif: "bg-win/15 text-win ring-win/30",
  Cadangan: "bg-muted text-muted-foreground ring-border",
  Cedera: "bg-loss/15 text-loss ring-loss/30",
};

export function StatusBadge({ status, className }: { status: PlayerStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
        statusStyle[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
