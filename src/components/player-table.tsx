import { Link } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PositionBadge, StatusBadge } from "@/components/position-badge";
import { players, usia } from "@/lib/demo-data";

export function PlayerTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-14 text-center">#</TableHead>
            <TableHead>Nama Pemain</TableHead>
            <TableHead className="w-16 text-center">Pos</TableHead>
            <TableHead className="text-center">Usia</TableHead>
            <TableHead className="text-center">Tinggi</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((p) => (
            <TableRow key={p.id} className="group">
              <TableCell className="text-center font-display text-lg text-muted-foreground group-hover:text-foreground">
                {p.nomor}
              </TableCell>
              <TableCell>
                <Link
                  to="/pemain/$id"
                  params={{ id: p.id }}
                  className="font-medium text-foreground transition-colors hover:text-field"
                >
                  {p.name}
                </Link>
              </TableCell>
              <TableCell className="text-center">
                <PositionBadge posisi={p.posisi} />
              </TableCell>
              <TableCell className="text-center text-muted-foreground">{usia(p.tanggalLahir)} thn</TableCell>
              <TableCell className="text-center text-muted-foreground">{p.tinggi} cm</TableCell>
              <TableCell className="text-center">
                <StatusBadge status={p.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
