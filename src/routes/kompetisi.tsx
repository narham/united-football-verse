import { Link } from "@tanstack/react-router";
import { Trophy, Plus } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

import { AppHeader } from "@/components/app-header";
import { MatchResultCard } from "@/components/match-result-card";
import { Button } from "@/components/ui/button";
import { matches, matchRecord } from "@/lib/demo-data";

export const Route = createFileRoute("/kompetisi")({
  head: () => ({
    meta: [
      { title: "Kompetisi — bolaID Football OS" },
      { name: "description", content: "Hasil pertandingan & rekam kompetisi SSB Garuda Muda." },
      { property: "og:title", content: "Kompetisi — bolaID Football OS" },
      { property: "og:description", content: "Hasil pertandingan & rekam kompetisi SSB Garuda Muda." },
    ],
  }),
  component: KompetisiPage,
});

function KompetisiPage() {
  const record = matchRecord();
  const total = record.w + record.d + record.l;

  return (
    <>
      <AppHeader title="Kompetisi" subtitle="Hasil pertandingan & rekam klub musim ini" />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Menang", v: record.w, tone: "text-win" },
            { l: "Imbang", v: record.d, tone: "text-draw" },
            { l: "Kalah", v: record.l, tone: "text-loss" },
            { l: "Gol / Bobol", v: `${record.gf}:${record.ga}`, tone: "text-foreground" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.l}</p>
              <p className={`mt-2 font-display text-3xl ${s.tone}`}>{s.v}</p>
            </div>
          ))}
        </section>

        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-foreground">Hasil Pertandingan</h2>
          <Button className="gap-1.5 bg-field text-field-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Catat Pertandingan
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {matches.map((m) => (
            <MatchResultCard key={m.id} match={m} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {total} pertandingan musim ini • rata-rata {total > 0 ? (record.gf / total).toFixed(1) : 0} gol per pertandingan
        </p>
      </main>
    </>
  );
}
