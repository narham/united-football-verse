import { createFileRoute } from "@tanstack/react-router";
import { Users2, Shield, Sparkles, Trophy } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PositionBadge } from "@/components/position-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBanner } from "@/components/error-state";
import { seasonStatsTotal } from "@/lib/demo-data";
import { useClub } from "@/hooks/useOrganization";
import { usePlayers } from "@/hooks/usePlayers";

export const Route = createFileRoute("/tim")({
  head: () => ({
    meta: [
      { title: "Tim — bolaID Football OS" },
      { name: "description", content: "Overview tim, susunan pemain, dan performa roster." },
      { property: "og:title", content: "Tim — bolaID Football OS" },
    ],
  }),
  component: TimPage,
});

function computeTeamStatTotals(playerList: Array<{ stats: Array<{ season: string; apps: number; goals: number; assists: number; minutes: number }> }>, season = "2025/2026") {
  let apps = 0, goals = 0, assists = 0;
  for (const p of playerList) {
    const s = seasonStatsTotal(p as any, season);
    apps += s.apps;
    goals += s.goals;
    assists += s.assists;
  }
  return { apps, goals, assists };
}

function TimPage() {
  const { data: club, isLoading: clubLoading, error: clubError, refetch: refetchClub } = useClub();
  const { data: players = [], isLoading: playersLoading, error: playersError, refetch: refetchPlayers } = usePlayers();
  const isLoading = clubLoading || playersLoading;
  const error = clubError || playersError;
  const refetch = () => { refetchClub(); refetchPlayers(); };

  const totals = computeTeamStatTotals(players);
  const topScorers = [...players]
    .sort((a, b) => seasonStatsTotal(b as any).goals - seasonStatsTotal(a as any).goals)
    .slice(0, 4);

  const clubName = club?.name ?? "SSB Garuda Muda";

  if (error) {
    return (
      <>
        <AppHeader title="Tim" subtitle={`${clubName} • roster inti & komposisi formasi`} />
        <main className="flex-1 space-y-5 p-4 md:p-6">
          <ErrorBanner
            title="Gagal memuat data tim"
            description={(error as Error)?.message ?? "Silakan coba lagi."}
            onRetry={refetch}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Tim" subtitle={`${clubName} • roster inti & komposisi formasi`} />
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <section className="grid gap-3 md:grid-cols-3">
          <Card className="border-field/30 bg-field/5">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-field">Pemain aktif</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-9 w-16" />
              ) : (
                <p className="mt-2 font-display text-3xl text-foreground">{players.filter((p) => p.status === "Aktif").length}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-energetic/30 bg-energetic/10">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-energetic-foreground">Gol musim ini</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-9 w-16" />
              ) : (
                <p className="mt-2 font-display text-3xl text-foreground">{totals.goals}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Main / musim</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-9 w-16" />
              ) : (
                <p className="mt-2 font-display text-3xl text-foreground">{totals.apps}</p>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-field" aria-hidden />
                <h2 className="font-display text-xl text-foreground">Susunan roster</h2>
              </div>
              <div className="mt-4 space-y-2">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-12 rounded" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  ))
                ) : (
                  players.slice(0, 8).map((player) => (
                    <div key={player.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <PositionBadge posisi={player.posisi} />
                        <div>
                          <p className="font-medium text-foreground">{player.name}</p>
                          <p className="text-xs text-muted-foreground">#{player.nomor} • {player.status}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {seasonStatsTotal(player as any).goals}G · {seasonStatsTotal(player as any).assists}A
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-energetic-foreground" aria-hidden />
                <h2 className="font-display text-xl text-foreground">Top pencetak</h2>
              </div>
              <div className="mt-4 space-y-2">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-7 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <Skeleton className="h-4 w-14 ml-auto" />
                        <Skeleton className="h-3 w-12 ml-auto" />
                      </div>
                    </div>
                  ))
                ) : (
                  topScorers.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-field/10 text-sm font-semibold text-field">{index + 1}</span>
                        <div>
                          <p className="font-medium text-foreground">{player.name}</p>
                          <p className="text-xs text-muted-foreground">{player.posisi}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{seasonStatsTotal(player as any).goals} gol</p>
                        <p className="text-xs text-muted-foreground">{seasonStatsTotal(player as any).assists} assist</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 rounded-xl border border-draw/20 bg-draw/5 p-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Shield className="h-4 w-4 text-draw" aria-hidden />
                  Fokus minggu ini: menjaga konsistensi bertahan dan distribusi passing.
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
