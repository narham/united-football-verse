import { useMemo, useState } from "react";
import { Users, UserPlus, Search } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

import { AppHeader } from "@/components/app-header";
import { PlayerTable } from "@/components/player-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import {
  players,
  type PlayerPosition,
  type PlayerStatus,
} from "@/lib/demo-data";

export const Route = createFileRoute("/pemain")({
  head: () => ({
    meta: [
      { title: "Pemain — bolaID Football OS" },
      {
        name: "description",
        content:
          "Daftar pemain SSB Garuda Muda: kelola roster, posisi, dan status.",
      },
      { property: "og:title", content: "Pemain — bolaID Football OS" },
      {
        property: "og:description",
        content: "Daftar pemain SSB Garuda Muda di ekosistem bolaID.",
      },
    ],
  }),
  component: PemainPage,
});

const posisiFilters: { value: PlayerPosition | "ALL"; label: string }[] = [
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
  { value: "Nonaktif", label: "Nonaktif" },
];

function PemainPage() {
  const [posisi, setPosisi] = useState<PlayerPosition | "ALL">("ALL");
  const [status, setStatus] = useState<PlayerStatus | "ALL">("ALL");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      players.filter(
        (p) =>
          (posisi === "ALL" || p.posisi === posisi) &&
          (status === "ALL" || p.status === status) &&
          (q.trim() === "" ||
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.football_id.toLowerCase().includes(q.toLowerCase())),
      ),
    [posisi, status, q],
  );

  return (
    <>
      <AppHeader
        title="Pemain"
        subtitle={`${players.length} pemain terdaftar di roster • ${players.filter((p) => p.status === "Aktif").length} aktif`}
      />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        {/* Search + CTA */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama / Football ID..."
              className="pl-9"
              aria-label="Cari pemain berdasarkan nama atau Football ID"
            />
          </div>
          <Button
            disabled
            className="gap-1.5 bg-field text-field-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Tambah pemain baru — fitur ini memerlukan koneksi backend"
            title="Fitur ini memerlukan koneksi backend (coming soon)"
          >
            <UserPlus className="h-4 w-4" aria-hidden /> Tambah Pemain
          </Button>
        </div>

        {/* Filter Groups §10: posisi + status */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Posisi
            </span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter posisi pemain">
              {posisiFilters.map((f) => (
                <Toggle
                  key={f.value}
                  pressed={posisi === f.value}
                  onPressedChange={() => setPosisi(f.value)}
                  size="sm"
                  aria-pressed={posisi === f.value}
                  aria-label={`Filter posisi ${f.label}`}
                >
                  {f.label}
                </Toggle>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter status pemain">
              {statusFilters.map((f) => (
                <Toggle
                  key={f.value}
                  pressed={status === f.value}
                  onPressedChange={() => setStatus(f.value)}
                  size="sm"
                  aria-pressed={status === f.value}
                  aria-label={`Filter status ${f.label}`}
                >
                  {f.label}
                </Toggle>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Menampilkan{" "}
          <span className="font-medium text-foreground">{filtered.length}</span>{" "}
          dari {players.length} pemain
        </p>

        {/* Critical: pass filtered to PlayerTable via `data` prop — so filter/search actually works */}
        <PlayerTable
          data={filtered}
          emptyMessage={
            q || posisi !== "ALL" || status !== "ALL"
              ? "Tidak ada pemain yang cocok dengan filter saat ini."
              : "Belum ada pemain terdaftar."
          }
        />

        {/* Placeholder for empty search with contextual help */}
        {filtered.length === 0 && (posisi !== "ALL" || status !== "ALL" || q) && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12 text-center md:hidden">
            <Users className="h-10 w-10 text-muted-foreground" aria-hidden />
            <p className="mt-3 font-medium text-foreground">Tidak ada pemain cocok</p>
            <p className="text-sm text-muted-foreground max-w-sm px-4">
              Coba ubah filter atau kata kunci pencarian.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setPosisi("ALL");
                  setStatus("ALL");
                  setQ("");
                }}
              >
                Reset filter
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
