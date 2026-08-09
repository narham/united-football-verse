import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PositionBadge, StatusBadge } from "@/components/position-badge";
import { DataState, DefaultEmptyState } from "@/components/data-state";
import { players as allPlayers, usia, seasonStatsTotal, type Player } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

// =========================
// Desktop: PlayerRow Table Row — spec §21 separate component
// =========================
export function PlayerRow({ player }: { player: Player }) {
  const stats = seasonStatsTotal(player);
  return (
    <TableRow className="group">
      <TableCell className="text-center font-display text-lg text-muted-foreground group-hover:text-foreground">
        {player.nomor}
      </TableCell>
      <TableCell>
        <Link
          to="/pemain/$id"
          params={{ id: player.id }}
          className="font-medium text-foreground transition-colors hover:text-field"
        >
          {player.name}
        </Link>
        <div className="mt-0.5 text-[11px] text-muted-foreground hidden md:block">
          ID: <span className="font-mono text-xs">{player.football_id}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <PositionBadge posisi={player.posisi} />
      </TableCell>
      <TableCell className="hidden md:table-cell text-center text-muted-foreground">
        {usia(player.tanggalLahir)} thn
      </TableCell>
      <TableCell className="hidden lg:table-cell text-center text-muted-foreground">
        {player.tinggi} cm
      </TableCell>
      <TableCell className="hidden lg:table-cell text-center text-muted-foreground">
        {stats.goals}G · {stats.assists}A
      </TableCell>
      <TableCell className="text-center">
        <StatusBadge status={player.status} />
      </TableCell>
    </TableRow>
  );
}

// =========================
// Mobile: PlayerCard — stacked/card presentation per §10/§22
// =========================
function PlayerCard({ player }: { player: Player }) {
  const stats = seasonStatsTotal(player);
  return (
    <Link
      to="/pemain/$id"
      params={{ id: player.id }}
      className="group block rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-field/40"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-field/10 font-display text-xl text-field ring-1 ring-field/20">
          {player.nomor}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground group-hover:text-field">
                {player.name}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {player.football_id}
              </p>
            </div>
            <StatusBadge status={player.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <PositionBadge posisi={player.posisi} />
            <span className="text-xs text-muted-foreground">
              {usia(player.tanggalLahir)} thn • {player.tinggi} cm
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-field">{stats.goals}G</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-energetic-foreground bg-energetic/20 px-1.5 rounded">
                {stats.assists}A
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// =========================
// Composite: PlayerTable (auto-switches layout desktop ↔ mobile)
// Accepts optional `data` prop — when supplied, used as filtered source.
// =========================
export function PlayerTable({
  data,
  status = "success",
  emptyMessage,
}: {
  data?: Player[];
  status?: "loading" | "empty" | "error" | "success";
  emptyMessage?: string;
}) {
  const source = data ?? allPlayers;

  return (
    <DataState
      status={source.length === 0 ? "empty" : status}
      emptyNode={
        <DefaultEmptyState
          icon={Users}
          title="Tidak ada pemain"
          description={emptyMessage ?? "Coba ubah filter atau kata kunci pencarian."}
        />
      }
    >
      <>
        {/* Mobile: Card List (< md) */}
        <div
          className={cn(
            "space-y-2.5 md:hidden",
            source.length === 0 && "hidden",
          )}
          role="list"
          aria-label="Daftar pemain (mobile view)"
        >
          {source.map((p) => (
            <div key={p.id} role="listitem">
              <PlayerCard player={p} />
            </div>
          ))}
        </div>

        {/* Desktop: Table (≥ md) */}
        <div
          className={cn(
            "hidden md:block overflow-x-auto rounded-xl border border-border bg-card",
            source.length === 0 && "hidden",
          )}
        >
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-14 text-center">#</TableHead>
                <TableHead>Nama Pemain</TableHead>
                <TableHead className="w-20 text-center">Pos</TableHead>
                <TableHead className="hidden md:table-cell text-center">Usia</TableHead>
                <TableHead className="hidden lg:table-cell text-center">Tinggi</TableHead>
                <TableHead className="hidden lg:table-cell text-center">Stat</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {source.map((p) => (
                <PlayerRow key={p.id} player={p} />
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    </DataState>
  );
}

export { PlayerCard };
