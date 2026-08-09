import { Link } from "@tanstack/react-router";
import {
  Users,
  Dumbbell,
  Trophy,
  Wallet,
  TrendingUp,
  ArrowRight,
  CalendarClock,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/stat-card";
import { TrainingSchedule } from "@/components/training-schedule";
import { MatchResultCard } from "@/components/match-result-card";
import { PositionBadge } from "@/components/position-badge";
import { FinanceSummary } from "@/components/finance-summary";
import { Badge } from "@/components/ui/badge";
import {
  club,
  players,
  matchRecord,
  financeTotals,
  formatRupiah,
  usia,
  seasonStatsTotal,
  pastMatches,
  upcomingMatches,
  competitions,
} from "@/lib/demo-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — bolaID Football OS" },
      {
        name: "description",
        content:
          "Ringkasan manajemen SSB Garuda Muda: pemain, latihan, hasil pertandingan, dan keuangan.",
      },
      { property: "og:title", content: "Dashboard — bolaID Football OS" },
      {
        property: "og:description",
        content:
          "Ringkasan manajemen SSB Garuda Muda di ekosistem bolaID: One Identity. One Journey. One Football Ecosystem.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const aktifCount = players.filter((p) => p.status === "Aktif").length;
  const record = matchRecord();
  const finance = financeTotals();
  const rosterSnapshot = [...players]
    .sort((a, b) => seasonStatsTotal(b).goals - seasonStatsTotal(a).goals)
    .slice(0, 4);
  const latestMatches = pastMatches().slice(0, 3);
  const upcoming = upcomingMatches().slice(0, 2);

  return (
    <>
      <AppHeader
        title={club.name}
        subtitle={`${club.sport} • ${club.city} • Kelola klub Anda di ekosistem bolaID`}
      />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {/* §9 Dashboard — Section KPI */}
        <section aria-label="Indikator Kinerja Utama" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Pemain Aktif"
            value={String(aktifCount)}
            hint={`${players.length} total pemain`}
            icon={Users}
            tone="field"
          />
          <StatCard
            label="Latihan / Minggu"
            value="4"
            hint="Senin–Sabtu"
            icon={Dumbbell}
            tone="energetic"
          />
          <StatCard
            label="Rekam Pertandingan"
            value={`${record.w}-${record.d}-${record.l}`}
            hint={`${record.gf} gol, ${record.ga} kebobolan`}
            icon={Trophy}
            tone="win"
          />
          <StatCard
            label="Saldo Klub"
            value={formatRupiah(finance.saldo)}
            hint={`${formatRupiah(finance.masuk)} pemasukan`}
            icon={Wallet}
            tone={finance.saldo >= 0 ? "field" : "loss"}
          />
        </section>

        {/* Upcoming + Latest Matches + Player Roster Snapshot */}
        <section className="grid gap-6 lg:grid-cols-3" aria-label="Aktivitas klub minggu ini">
          <div className="space-y-4 lg:col-span-2">
            {/* Upcoming Matches per §9 */}
            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-2xl text-foreground">
                      Pertandingan Mendatang
                    </h2>
                    <Badge
                      variant="outline"
                      className="border-energetic/30 bg-energetic/5 text-energetic-foreground"
                    >
                      <CalendarClock className="h-3 w-3 mr-1" aria-hidden />
                      {upcoming.length} segera
                    </Badge>
                  </div>
                  <Link
                    to="/kompetisi"
                    className="inline-flex items-center gap-1 text-sm font-medium text-field hover:underline"
                  >
                    Semua <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {upcoming.map((m) => (
                    <MatchResultCard key={m.id} match={m} />
                  ))}
                </div>
              </div>
            )}

            {/* Latest Matches per §9 */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-foreground">
                  Hasil Pertandingan
                </h2>
                <Link
                  to="/kompetisi"
                  className="inline-flex items-center gap-1 text-sm font-medium text-field hover:underline"
                >
                  Semua <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {latestMatches.map((m) => (
                  <MatchResultCard key={m.id} match={m} />
                ))}
              </div>
            </div>

            {/* Player Roster Snapshot per §9 */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-foreground">
                  Roster Pemain
                </h2>
                <Link
                  to="/pemain"
                  className="inline-flex items-center gap-1 text-sm font-medium text-field hover:underline"
                >
                  Roster lengkap <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {rosterSnapshot.map((p, i) => {
                  const s = seasonStatsTotal(p);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-field/40"
                    >
                      <span className="font-display text-2xl text-muted-foreground">
                        {i + 1}
                      </span>
                      <PositionBadge posisi={p.posisi} />
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/pemain/$id"
                          params={{ id: p.id }}
                          className="block truncate font-medium text-foreground hover:text-field"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {usia(p.tanggalLahir)} thn • #{p.nomor} • {p.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="flex items-center gap-1 font-display text-xl text-field">
                          <TrendingUp className="h-4 w-4" aria-hidden />
                          {s.goals}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.assists} assist
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Upcoming Training per §9 */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-foreground">
                  Jadwal Latihan
                </h2>
                <Link
                  to="/latihan"
                  className="inline-flex items-center gap-1 text-sm font-medium text-field hover:underline"
                >
                  Detail <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div className="mt-3">
                <TrainingSchedule />
              </div>
            </div>

            {/* Competition List mini */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-display text-xl text-foreground mb-2.5">
                Kompetisi Aktif
              </h3>
              <ul className="space-y-2">
                {competitions.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {c.name} {c.season}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.level}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {c.season}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Finance Summary Section per §9 */}
        <section aria-label="Ringkasan keuangan klub">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-foreground">
              Ringkasan Keuangan
            </h2>
            <Link
              to="/keuangan"
              className="inline-flex items-center gap-1 text-sm font-medium text-field hover:underline"
            >
              Lihat semua transaksi <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-3">
            <FinanceSummary />
          </div>
        </section>
      </main>
    </>
  );
}
