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
import { formatRupiah, usia, seasonStatsTotal } from "@/lib/demo-data";
import { useClub } from "@/hooks/useOrganization";
import { usePlayers } from "@/hooks/usePlayers";
import {
  useMatchRecordStats,
  usePastMatches,
  useUpcomingMatches,
} from "@/hooks/useMatches";
import { useFinanceTotals } from "@/hooks/useFinance";
import { useCompetitions } from "@/hooks/useCompetitions";
import { useTrainingSessions } from "@/hooks/useTraining";

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
  const club = useClub().data;
  const players = usePlayers().data ?? [];
  const record = useMatchRecordStats().data ?? { w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  const finance = useFinanceTotals().data ?? { masuk: 0, keluar: 0, saldo: 0 };
  const pastMatchesData = usePastMatches().data ?? [];
  const upcomingMatchesData = useUpcomingMatches().data ?? [];
  const competitions = useCompetitions().data ?? [];
  const trainingSessions = useTrainingSessions().data ?? [];

  if (!club) {
    return <div>Loading...</div>;
  }

  const aktifCount = players.filter((p) => p.status === "Aktif").length;
  const rosterSnapshot = [...players]
    .sort((a, b) => seasonStatsTotal(b).goals - seasonStatsTotal(a).goals)
    .slice(0, 4);
  const latestMatches = pastMatchesData.slice(0, 3);
  const upcoming = upcomingMatchesData.slice(0, 2);

  return (
    <>
      <AppHeader
        title={club.name}
        subtitle={`${club.sport} • ${club.city} • Kelola klub Anda di ekosistem bolaID`}
      />
      <main className="flex-1 space-y-8 p-4 md:p-6">
        {/* Welcome Section with Context */}
        <section className="rounded-2xl border border-border bg-gradient-to-br from-field/10 via-card to-card p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-3xl text-foreground mb-2">
                Selamat datang kembali, Manager! 👋
              </h2>
              <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
                Kelola performa klub {club.name} dengan lebih efisien. Pantau pemain, latihan, pertandingan, dan keuangan
                dari satu dashboard terpadu.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/pemain"
                  className="inline-flex items-center gap-2 rounded-lg bg-field px-3.5 py-2 text-sm font-medium text-field-foreground hover:bg-field/90 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Kelola Pemain
                </Link>
                <Link
                  to="/latihan"
                  className="inline-flex items-center gap-2 rounded-lg border border-field/30 bg-field/5 px-3.5 py-2 text-sm font-medium text-field hover:bg-field/10 transition-colors"
                >
                  <Dumbbell className="h-4 w-4" />
                  Jadwal Latihan
                </Link>
                <Link
                  to="/kompetisi"
                  className="inline-flex items-center gap-2 rounded-lg border border-energetic/30 bg-energetic/5 px-3.5 py-2 text-sm font-medium text-energetic-foreground hover:bg-energetic/10 transition-colors"
                >
                  <Trophy className="h-4 w-4" />
                  Kompetisi
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* §9 Dashboard — Section KPI */}
        <section aria-label="Indikator Kinerja Utama" className="space-y-3">
          <h3 className="font-display text-lg text-foreground/80 uppercase tracking-wide">
            Metrik Klub
          </h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
          </div>
        </section>

        {/* Upcoming + Latest Matches + Player Roster Snapshot */}
        <section className="space-y-6" aria-label="Aktivitas klub minggu ini">
          <h3 className="font-display text-lg text-foreground/80 uppercase tracking-wide">
            Aktivitas & Performa
          </h3>
          
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* Upcoming Matches per §9 */}
              {upcoming.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">
                        Pertandingan Mendatang
                      </h4>
                      <Badge
                        variant="outline"
                        className="border-energetic/30 bg-energetic/5 text-energetic-foreground text-xs"
                      >
                        <CalendarClock className="h-3 w-3 mr-1" aria-hidden />
                        {upcoming.length} segera
                      </Badge>
                    </div>
                    <Link
                      to="/kompetisi"
                      className="inline-flex items-center gap-1 text-xs font-medium text-field hover:underline"
                    >
                      Semua <ArrowRight className="h-3 w-3" aria-hidden />
                    </Link>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {upcoming.map((m) => (
                      <MatchResultCard key={m.id} match={m} />
                    ))}
                  </div>
                </div>
              )}

              {/* Latest Matches per §9 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">
                    Hasil Pertandingan Terakhir
                  </h4>
                  <Link
                    to="/kompetisi"
                    className="inline-flex items-center gap-1 text-xs font-medium text-field hover:underline"
                  >
                    Semua <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {latestMatches.map((m) => (
                    <MatchResultCard key={m.id} match={m} />
                  ))}
                </div>
              </div>

              {/* Player Roster Snapshot per §9 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">
                    Top Pemain (Gol)
                  </h4>
                  <Link
                    to="/pemain"
                    className="inline-flex items-center gap-1 text-xs font-medium text-field hover:underline"
                  >
                    Roster lengkap <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
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
                            className="block truncate font-medium text-foreground hover:text-field text-sm"
                          >
                            {p.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {usia(p.tanggalLahir)} thn • #{p.nomor}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="flex items-center gap-1 font-display text-lg text-field">
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
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">
                    Jadwal Latihan
                  </h4>
                  <Link
                    to="/latihan"
                    className="inline-flex items-center gap-1 text-xs font-medium text-field hover:underline"
                  >
                    Detail <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
                </div>
                <TrainingSchedule sessions={trainingSessions} />
              </div>

              {/* Competition List mini */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground mb-3">
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
          </div>
        </section>


        {/* Finance Summary Section per §9 */}
        <section aria-label="Ringkasan keuangan klub" className="space-y-4">
          <h3 className="font-display text-lg text-foreground/80 uppercase tracking-wide">
            Keuangan Klub
          </h3>
          <FinanceSummary />
        </section>
      </main>
    </>
  );
}
