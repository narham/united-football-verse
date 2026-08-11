import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Flag, Trophy } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { teamStatTotals } from "@/lib/demo-data"; // Allowed: pure utility function
import { useClub } from "@/hooks/useOrganization";
import { useCompetitions } from "@/hooks/useCompetitions";
import { useMatches } from "@/hooks/useMatches";
import { useActiveSeason } from "@/hooks/useSeasons";

export const Route = createFileRoute("/musim")({
  head: () => ({
    meta: [
      { title: "Musim — bolaID Football OS" },
      { name: "description", content: "Milestone musim, kompetisi, dan target perkembangan klub." },
      { property: "og:title", content: "Musim — bolaID Football OS" },
    ],
  }),
  component: MusimPage,
});

function MusimPage() {
  const totals = teamStatTotals();
  const clubQuery = useClub();
  const competitions = useCompetitions().data ?? [];
  const matches = useMatches().data ?? [];
  const activeSeason = useActiveSeason().data;
  const seasonLabel = clubQuery.data?.season ?? activeSeason?.name ?? "";
  return (
    <>
      <AppHeader title="Musim" subtitle={`${seasonLabel} • milestone dan target pertumbuhan`} />
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <section className="grid gap-3 md:grid-cols-3">
          <Card className="border-field/30 bg-field/5">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-field">Kompetisi berjalan</p>
              <p className="mt-2 font-display text-3xl text-foreground">{competitions.length}</p>
            </CardContent>
          </Card>
          <Card className="border-energetic/30 bg-energetic/10">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-energetic-foreground">Pertandingan</p>
              <p className="mt-2 font-display text-3xl text-foreground">{matches.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Rata-rata kontribusi</p>
              <p className="mt-2 font-display text-3xl text-foreground">{(totals.goals / Math.max(1, totals.apps)).toFixed(1)}</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-field" aria-hidden />
                <h2 className="font-display text-xl text-foreground">Milestone musim</h2>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { title: "Pendaftaran roster lengkap", detail: "Semua pemain terverifikasi dengan Football ID." },
                  { title: "Kompetisi internasional awal", detail: "Piala Gensa Cup menjadi benchmark performa awal." },
                  { title: "Integrasi attendance", detail: "Training attendance dan pemantauan cedera siap diaktifkan." },
                ].map((item) => (
                  <div key={item.title} className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-energetic-foreground" aria-hidden />
                <h2 className="font-display text-xl text-foreground">Kompetisi dipantau</h2>
              </div>
              <div className="mt-4 space-y-2">
                {competitions.map((competition) => (
                  <div key={competition.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                    <div>
                      <p className="font-medium text-foreground">{competition.name}</p>
                      <p className="text-xs text-muted-foreground">{competition.level}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {competition.season}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-field" aria-hidden />
                Jadwal pertandingan dan ekstraksi hasil akan terus diperbarui di dashboard.
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
