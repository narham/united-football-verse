import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { PlayerProfileCard } from "@/components/player-profile-card";
import { Button } from "@/components/ui/button";
import { playerById } from "@/lib/demo-data";

export const Route = createFileRoute("/pemain/$id")({
  loader: ({ params }) => {
    const player = playerById(params.id);
    if (!player) throw notFound();
    return { player };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.player.name ?? "Pemain";
    return {
      meta: [
        { title: `${name} — bolaID Football OS` },
        { name: "description", content: `Profil & statistik ${name} di SSB Garuda Muda.` },
        { property: "og:title", content: `${name} — bolaID Football OS` },
        { property: "og:description", content: `Profil pemain ${name} di ekosistem bolaID.` },
      ],
    };
  },
  component: PlayerDetailPage,
});

function PlayerDetailPage() {
  const { player } = Route.useLoaderData();

  return (
    <>
      <AppHeader title={player.name} subtitle={`#${player.nomor} • Profil Pemain`} />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/pemain" className="hover:text-field">Pemain</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{player.name}</span>
        </nav>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link to="/pemain"><ArrowLeft className="h-4 w-4" /> Kembali ke roster</Link>
        </Button>
        <PlayerProfileCard player={player} />
      </main>
    </>
  );
}
