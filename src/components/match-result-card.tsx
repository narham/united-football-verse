import { cn } from "@/lib/utils";
import { club, matchResult, type Match } from "@/lib/demo-data";

function resultBadge(r: ReturnType<typeof matchResult>) {
  if (r === "W") return "bg-win text-white";
  if (r === "D") return "bg-draw text-black/70";
  return "bg-loss text-white";
}
function resultLabel(r: ReturnType<typeof matchResult>) {
  return r === "W" ? "Menang" : r === "D" ? "Imbang" : "Kalah";
}

export function MatchResultCard({ match }: { match: Match }) {
  const isHome = match.venue === "Kandang";
  const r = matchResult(match);
  const kitaSkor = isHome ? match.skorHome : match.skorAway;
  const lawanSkor = isHome ? match.skorAway : match.skorHome;
  const lawanNama = isHome ? match.lawan : match.lawan;
  const kitaLabel = isHome ? club.short : match.lawan === club.name ? club.short : club.short;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-field/40">
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold", resultBadge(r))}>
        {r}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-muted-foreground">{match.competition}</p>
        <p className="mt-0.5 font-medium text-foreground">
          {isHome ? `${kitaLabel} vs ${lawanNama}` : `${lawanNama} vs ${kitaLabel}`}
        </p>
      </div>
      <div className="text-right">
        <p className="font-display text-2xl leading-none text-foreground">
          {kitaSkor}<span className="mx-1 text-muted-foreground">:</span>{lawanSkor}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{resultLabel(r)} • {new Date(match.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
      </div>
    </div>
  );
}
