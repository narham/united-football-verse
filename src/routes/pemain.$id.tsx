import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { PlayerProfileCard } from "@/components/player-profile-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";
import { usePlayer } from "@/hooks/usePlayers";

export const Route = createFileRoute("/pemain/$id")({
  component: PlayerDetailPage,
});

function PlayerDetailPage() {
  const params = Route.useParams();
  const { data: player, isLoading, error, refetch, isFetched } = usePlayer(params.id);

  if (error) {
    return (
      <>
        <AppHeader title="Pemain" subtitle="Profil Pemain" />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <ErrorState
            type="server-error"
            title="Gagal memuat data pemain"
            description={(error as Error)?.message ?? "Silakan coba lagi."}
            onRetry={refetch}
          />
        </main>
      </>
    );
  }

  if (isFetched && !player) {
    throw notFound();
  }

  const playerName = player?.name ?? "Memuat...";
  const playerNomor = player?.nomor;

  return (
    <>
      <AppHeader title={playerName} subtitle={playerNomor ? `#${playerNomor} • Profil Pemain` : "Profil Pemain"} />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/pemain" className="hover:text-field">Pemain</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">
            {isLoading ? <Skeleton className="h-4 w-24 inline-block align-middle" /> : playerName}
          </span>
        </nav>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link to="/pemain"><ArrowLeft className="h-4 w-4" /> Kembali ke roster</Link>
        </Button>
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-40 w-full rounded-xl" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        ) : player ? (
          <PlayerProfileCard player={player} />
        ) : null}
      </main>
    </>
  );
}
