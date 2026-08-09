import { Link } from "@tanstack/react-router";
import { Users, Dumbbell, Trophy, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/stat-card";
import { TrainingSchedule } from "@/components/training-schedule";
import { MatchResultCard } from "@/components/match-result-card";
import { PositionBadge } from "@/components/position-badge";
import {
  club,
  players,
  matches,
  matchRecord,
  financeTotals,
  formatRupiah,
  usia,
  seasonStatsTotal,
} from "@/lib/demo-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — bolaID Football OS" },
      { name: "description", content: "Ringkasan manajemen SSB Garuda Muda: pemain, latihan, hasil pertandingan, dan keuangan." },
      { property: "og:title", content: "Dashboard — bolaID Football OS" },
      { property: "og:description", content: "Ringkasan manajemen SSB Garuda Muda di ekosistem bolaID." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const aktifCount = players.filter((p) => p.status === "Aktif").length;
  const record = matchRecord();
  const finance = financeTotals();
  const topScorers = [...players]
    .sort((a, b) => seasonStatsTotal(b).goals - seasonStatsTotal(a).goals)
    .slice(0, 4);
  const recentMatches = matches.slice(0, 3);

  return (
    <>
      <AppHeader
        title={club.name}
        subtitle={`Selamat datang kembali — kelola klub Anda di ekosistem bolaID`}
      />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Pemain Aktif" value={String(aktifCount)} hint={`${players.length} total pemain`} icon={Users} tone="field" />
          <StatCard label="Latihan / Minggu" value="4" hint="Senin–Sabtu" icon={Dumbbell} tone="energetic" />
          <StatCard label="Rekam Pertandingan" value={`${record.w}-${record.d}-${record.l}`} hint={`${record.gf} gol, ${record.ga} kebobolan`} icon={Trophy} tone="win" />
          <StatCard label="Saldo Klub" value={formatRupiah(finance.saldo)} hint={`${formatRupiah(finance.masuk)} masuk`} icon={Wallet} tone={finance.saldo >= 0 ? "field" : "loss"} />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-foreground">Hasil Pertandingan</h2>
              <Link to="/kompetisi" className="inline-flex items-center gap-1 text-sm font-medium text-field hover:underline">
                Semua <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {recentMatches.map((m) => (
                <MatchResultCard key={m.id} match={m} />
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <h2 className="font-display text-2xl text-foreground">Top Skor Musim Ini</h2>
              <Link to="/pemain" className="inline-flex items-center gap-1 text-sm font-medium text-field hover:underline">
                Roster <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {topScorers.map((p, i) => {
                const s = seasonStatsTotal(p);
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <span className="font-display text-2xl text-muted-foreground">{i + 1}</span>
                    <PositionBadge posisi={p.posisi} />
                    <div className="min-w-0 flex-1">
                      <Link to="/pemain/$id" params={{ id: p.id }} className="block truncate font-medium text-foreground hover:text-field">
                        {p.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{usia(p.tanggalLahir)} thn • #{p.nomor}</p>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center gap-1 font-display text-xl text-field">
                        <TrendingUp className="h-4 w-4" />{s.goals}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.assists} assist</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-foreground">Jadwal Latihan</h2>
              <Link to="/latihan" className="inline-flex items-center gap-1 text-sm font-medium text-field hover:underline">
                Detail <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <TrainingSchedule />
          </div>
        </section>
      </main>
    </>
  );
}
