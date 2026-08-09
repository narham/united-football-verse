import { PositionBadge, StatusBadge } from "@/components/position-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usia, type Player } from "@/lib/demo-data";

export function PlayerProfileCard({ player }: { player: Player }) {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="pitch-lines h-20 bg-field/5" />
        <div className="flex items-center gap-4 px-5 pb-5 pt-1">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-field font-display text-3xl text-field-foreground ring-4 ring-card">
            {player.nomor}
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-3xl leading-tight text-foreground">{player.name}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <PositionBadge posisi={player.posisi} />
              <StatusBadge status={player.status} />
              <span className="text-sm text-muted-foreground">#{player.nomor} • {usia(player.tanggalLahir)} tahun</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Tinggi", v: `${player.tinggi} cm` },
          { l: "Berat", v: `${player.berat} kg` },
          { l: "Kaki Utama", v: player.kaki },
          { l: "Tgl Lahir", v: new Date(player.tanggalLahir).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) },
        ].map((x) => (
          <div key={x.l} className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{x.l}</p>
            <p className="mt-1 font-medium text-foreground">{x.v}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-display text-xl text-foreground">Statistik per Musim</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Musim</TableHead>
              <TableHead className="text-center">Main</TableHead>
              <TableHead className="text-center">Gol</TableHead>
              <TableHead className="text-center">Assist</TableHead>
              <TableHead className="text-center">Menit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {player.stats.map((s) => (
              <TableRow key={s.season}>
                <TableCell className="font-medium">{s.season}</TableCell>
                <TableCell className="text-center">{s.apps}</TableCell>
                <TableCell className="text-center font-semibold text-field">{s.goals}</TableCell>
                <TableCell className="text-center">{s.assists}</TableCell>
                <TableCell className="text-center text-muted-foreground">{s.minutes}'</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
