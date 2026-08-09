import { Link } from "@tanstack/react-router";
import { Trophy, Plus, CalendarClock, Target, Award, ArrowRight, ChevronRight } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

import { AppHeader } from "@/components/app-header";
import { MatchResultCard } from "@/components/match-result-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  matches,
  matchRecord,
  pastMatches,
  upcomingMatches,
  competitions,
} from "@/lib/demo-data";

export const Route = createFileRoute("/kompetisi")({
  head: () => ({
    meta: [
      { title: "Kompetisi — bolaID Football OS" },
      {
        name: "description",
        content:
          "Hasil pertandingan & rekam kompetisi SSB Garuda Muda musim ini.",
      },
      { property: "og:title", content: "Kompetisi — bolaID Football OS" },
      {
        property: "og:description",
        content:
          "Hasil pertandingan & rekam kompetisi SSB Garuda Muda di Football OS.",
      },
    ],
  }),
  component: KompetisiPage,
});

function KompetisiPage() {
  const record = matchRecord();
  const past = pastMatches();
  const upcoming = upcomingMatches();
  const totalPlayed = past.length;

  return (
    <>
      <AppHeader
        title="Kompetisi"
        subtitle="Hasil pertandingan, jadwal mendatang, dan kompetisi klub musim ini"
      />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {/* Section 1: Summary KPI — §13 */}
        <section
          aria-label="Rekam jejak pertandingan"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <div className="rounded-xl border border-win/30 bg-win/5 p-4">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-win">
              <Award className="h-3.5 w-3.5" aria-hidden /> Menang
            </p>
            <p className="mt-2 font-display text-3xl text-foreground">
              {record.w}
            </p>
          </div>
          <div className="rounded-xl border border-draw/30 bg-draw/5 p-4">
            <p className="text-xs uppercase tracking-wide text-draw">Imbang</p>
            <p className="mt-2 font-display text-3xl text-foreground">
              {record.d}
            </p>
          </div>
          <div className="rounded-xl border border-loss/30 bg-loss/5 p-4">
            <p className="text-xs uppercase tracking-wide text-loss">Kalah</p>
            <p className="mt-2 font-display text-3xl text-foreground">
              {record.l}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <Target className="h-3.5 w-3.5" aria-hidden /> Gol : Bobol
            </p>
            <p className="mt-2 font-display text-3xl text-foreground">
              <span className="text-win">{record.gf}</span>
              <span className="mx-1 text-muted-foreground">:</span>
              <span className="text-loss">{record.ga}</span>
            </p>
          </div>
        </section>

        {/* Section 2: Competitions Active (per §13 competition/season/level) */}
        <section aria-label="Kompetisi berjalan" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-foreground">
              Kompetisi Musim {club_season_fallback()}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {competitions.map((c) => {
              const cMatches = matches.filter((m) => m.competitionId === c.id);
              const cPast = cMatches.filter((m) => m.skorHome !== null);
              return (
                <Link
                  key={c.id}
                  to="/kompetisi/$id"
                  params={{ id: c.id }}
                  className="group block rounded-xl border border-border bg-card p-4 transition-all hover:border-field/50 hover:bg-card/80 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {c.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c.level}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {c.season}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-field" aria-hidden />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="border-field/20 text-field bg-field/5">
                      {cPast.length} pertandingan
                    </Badge>
                    {cMatches.length - cPast.length > 0 && (
                      <Badge variant="outline" className="border-energetic/20 text-energetic-foreground bg-energetic/10">
                        {cMatches.length - cPast.length} menanti
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Upcoming Matches §13 — UPCOMING status */}
        {upcoming.length > 0 && (
          <section aria-label="Pertandingan mendatang" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl text-foreground">
                  Mendatang
                </h2>
                <Badge
                  variant="outline"
                  className="border-energetic/30 bg-energetic/10 text-energetic-foreground"
                >
                  <CalendarClock className="h-3 w-3 mr-1" aria-hidden />
                  UPCOMING
                </Badge>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {upcoming.map((m) => (
                <Link key={m.id} to="/kompetisi/$id" params={{ id: m.id }}>
                  <MatchResultCard match={m} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Match History §13 */}
        <section aria-label="Riwayat hasil pertandingan" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-foreground">
              Riwayat Pertandingan
            </h2>
            <Button
              className="gap-1.5 bg-field text-field-foreground hover:opacity-90"
              aria-label="Catat pertandingan baru"
            >
              <Plus className="h-4 w-4" aria-hidden /> Catat Pertandingan
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {past.map((m) => (
              <Link key={m.id} to="/kompetisi/$id" params={{ id: m.id }}>
                <MatchResultCard match={m} />
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {totalPlayed} pertandingan musim ini • rata-rata{" "}
            {totalPlayed > 0 ? (record.gf / totalPlayed).toFixed(1) : 0} gol per
            pertandingan
          </p>
        </section>
      </main>
    </>
  );
}

// Helper to avoid circular-ish import (season info for heading fallback)
function club_season_fallback(): string {
  return "2026/2027";
}
