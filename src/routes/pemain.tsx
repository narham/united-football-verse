import { useMemo, useState } from "react";
import { Users, UserPlus, Search } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

import { AppHeader } from "@/components/app-header";
import { PlayerTable } from "@/components/player-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { players, type Position, type PlayerStatus } from "@/lib/demo-data";

export const Route = createFileRoute("/pemain")({
  head: () => ({
    meta: [
      { title: "Pemain — bolaID Football OS" },
      { name: "description", content: "Daftar pemain SSB Garuda Muda: kelola roster, posisi, dan status." },
      { property: "og:title", content: "Pemain — bolaID Football OS" },
      { property: "og:description", content: "Daftar pemain SSB Garuda Muda di ekosistem bolaID." },
    ],
  }),
  component: PemainPage,
});

const posisiFilters: { value: Position | "ALL"; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "GK", label: "GK" },
  { value: "DF", label: "DF" },
  { value: "MF", label: "MF" },
  { value: "FW", label: "FW" },
];
const statusFilters: { value: PlayerStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "Aktif", label: "Aktif" },
  { value: "Cadangan", label: "Cadangan" },
  { value: "Cedera", label: "Cedera" },
];

function PemainPage() {
  const [posisi, setPosisi] = useState<Position | "ALL">("ALL");
  const [status, setStatus] = useState<PlayerStatus | "ALL">("ALL");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      players.filter(
        (p) =>
          (posisi === "ALL" || p.posisi === posisi) &&
          (status === "ALL" || p.status === status) &&
          (q.trim() === "" || p.name.toLowerCase().includes(q.toLowerCase())),
      ),
    [posisi, status, q],
  );

  return (
    <>
      <AppHeader title="Pemain" subtitle={`${players.length} pemain terdaftar di roster`} />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama pemain..."
              className="pl-9"
            />
          </div>
          <Button className="gap-1.5 bg-field text-field-foreground hover:opacity-90">
            <UserPlus className="h-4 w-4" /> Tambah Pemain
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Posisi</span>
            <div className="flex flex-wrap gap-1.5">
              {posisiFilters.map((f) => (
                <Toggle
                  key={f.value}
                  pressed={posisi === f.value}
                  onPressedChange={() => setPosisi(f.value)}
                  size="sm"
                >
                  {f.label}
                </Toggle>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</span>
            <div className="flex flex-wrap gap-1.5">
              {statusFilters.map((f) => (
                <Toggle
                  key={f.value}
                  pressed={status === f.value}
                  onPressedChange={() => setStatus(f.value)}
                  size="sm"
                >
                  {f.label}
                </Toggle>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Menampilkan <span className="font-medium text-foreground">{filtered.length}</span> pemain
        </p>

        {filtered.length > 0 ? (
          <PlayerTable />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium text-foreground">Tidak ada pemain cocok</p>
            <p className="text-sm text-muted-foreground">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        )}
      </main>
    </>
  );
}
