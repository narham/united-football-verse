import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, CalendarDays, Flag, Shield, Sparkles } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { matchById, matchResult, type Match } from "@/lib/demo-data";

export const Route = createFileRoute("/kompetisi/$id")({
  loader: ({ params }) => {
    const match = matchById(params.id);
    if (!match) throw notFound();
    return { match };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.match.lawan} — bolaID Football OS` },
      { name: "description", content: `Detail pertandingan ${loaderData?.match.lawan} dan susunan event demo.` },
      { property: "og:title", content: `${loaderData?.match.lawan} — bolaID Football OS` },
    ],
  }),
  component: MatchDetailPage,
});

function MatchDetailPage() {
  const { match } = Route.useLoaderData();
  const result = matchResult(match);
  const badgeClass = {
    win: "border-win/30 bg-win/10 text-win",
    draw: "border-draw/30 bg-draw/10 text-draw",
    loss: "border-loss/30 bg-loss/10 text-loss",
    upcoming: "border-energetic/30 bg-energetic/10 text-energetic-foreground",
  }[result];

  return (
    <>
      <AppHeader title="Detail Pertandingan" subtitle={`${match.competitionName} • ${match.lawan}`} />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/kompetisi" className="hover:text-field">Kompetisi</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{match.lawan}</span>
        </nav>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link to="/kompetisi"><ArrowLeft className="h-4 w-4" /> Kembali ke kompetisi</Link>
        </Button>

        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{match.competitionName}</p>
                <h2 className="mt-1 font-display text-2xl text-foreground">{match.lawan}</h2>
              </div>
              <Badge variant="outline" className={badgeClass}>Status: {result === "upcoming" ? "menunggu" : result}</Badge>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" aria-hidden /> Tanggal
                </div>
                <p className="mt-2 font-medium text-foreground">{new Date(match.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Flag className="h-4 w-4" aria-hidden /> Venue
                </div>
                <p className="mt-2 font-medium text-foreground">{match.venue}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" aria-hidden /> Skor
                </div>
                <p className="mt-2 font-medium text-foreground">{match.skorHome ?? "—"} : {match.skorAway ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-field" aria-hidden />
                <h3 className="font-display text-xl text-foreground">Line-up & event</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Starter: Bagas Pratama, Rizky Maulana, Fajar Nugroho, Galang Saputra, Reza Pratama, Surya Darma.</p>
                <p>Event demo: gol menit 32 oleh Surya Darma, kartu kuning untuk Rizky Maulana, pergantian pemain pada menit 70.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-energetic-foreground" aria-hidden />
                <h3 className="font-display text-xl text-foreground">Catatan taktik</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Formasi yang dipilih: 4-3-3 dengan pressing tinggi di menit awal.</p>
                <p>Area prioritas: konsistensi transisi dan penguasaan bola di lini tengah.</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
