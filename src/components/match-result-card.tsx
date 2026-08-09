import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { club, matchResult, type Match, type MatchResult as TResult } from "@/lib/demo-data";

function resultBadgeClass(r: TResult): string {
  switch (r) {
    case "win":
      return "bg-win text-white";
    case "draw":
      return "bg-draw text-black/70";
    case "loss":
      return "bg-loss text-white";
    case "upcoming":
      return "bg-muted text-muted-foreground ring-1 ring-border";
  }
}

function resultLabel(r: TResult): string {
  switch (r) {
    case "win":
      return "Menang";
    case "draw":
      return "Imbang";
    case "loss":
      return "Kalah";
    case "upcoming":
      return "Segera";
  }
}

export function MatchResultCard({ match }: { match: Match }) {
  const isHome = match.venue === "Kandang" || match.venue === "Netral";
  const r = matchResult(match);
  const kitaSkor = isHome ? match.skorHome : match.skorAway;
  const lawanSkor = isHome ? match.skorAway : match.skorHome;
  const lawanNama = match.lawan;
  const kitaLabel = club.short;

  const dateLabel = new Date(match.tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-3.5 transition-colors",
        r === "upcoming" ? "border-energetic/30 hover:border-energetic/50" : "border-border hover:border-field/40",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
          resultBadgeClass(r),
        )}
        aria-label={`Hasil: ${resultLabel(r)}`}
      >
        {r === "win" ? "W" : r === "draw" ? "D" : r === "loss" ? "L" : "→"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-muted-foreground">
          {match.competitionName}
        </p>
        <p className="mt-0.5 font-medium text-foreground">
          {isHome ? `${kitaLabel} vs ${lawanNama}` : `${lawanNama} vs ${kitaLabel}`}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden />
            {dateLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" aria-hidden />
            {match.venue}
          </span>
        </div>
      </div>
      <div className="text-right">
        {r === "upcoming" ? (
          <>
            <p className="font-display text-xl leading-none text-energetic-foreground bg-energetic/20 px-2 py-1 rounded">
              VS
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-energetic-foreground/70">
              {resultLabel(r)}
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-2xl leading-none text-foreground">
              {kitaSkor}
              <span className="mx-1 text-muted-foreground">:</span>
              {lawanSkor}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{resultLabel(r)}</p>
          </>
        )}
      </div>
    </article>
  );
}
