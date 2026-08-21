import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Plus, Users2 } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { TrainingSchedule } from "@/components/training-schedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataState } from "@/components/data-state";
import { useTrainingSessions } from "@/hooks/useTraining";

export const Route = createFileRoute("/latihan")({
  head: () => ({
    meta: [
      { title: "Latihan — bolaID Football OS" },
      { name: "description", content: "Jadwal dan sesi latihan SSB Garuda Muda sepanjang minggu." },
      { property: "og:title", content: "Latihan — bolaID Football OS" },
      { property: "og:description", content: "Jadwal dan sesi latihan SSB Garuda Muda." },
    ],
  }),
  component: LatihanPage,
});

function LatihanPage() {
  const sessionsQuery = useTrainingSessions();
  const trainingSessions = sessionsQuery.data ?? [];
  return (
    <>
      <AppHeader title="Latihan" subtitle={`${trainingSessions.length} sesi per minggu • Fokus minggu ini: Akselerasi passing`} />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-energetic/10 via-card to-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl text-foreground">Minggu ini: Fokus pada kondisi fisik 💪</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Sesi latihan dirancang untuk meningkatkan power endurance dan akselerasi passing pendek. Recovery session pada Sabtu mempersiapkan pertandingan minggu depan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Jadwal latihan reguler musim 2026/2027
          </p>
          <Button
            disabled
            className="gap-1.5 bg-field text-field-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Fitur ini memerlukan koneksi backend (coming soon)"
            aria-label="Tambah sesi latihan baru — fitur ini memerlukan koneksi backend"
          >
            <Plus className="h-4 w-4" /> Tambah Sesi
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-field" aria-hidden />
                <h3 className="font-semibold text-foreground">Kehadiran minggu lalu</h3>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Hadir", value: "17/20", dot: "bg-field" },
                  { label: "Sakit/Izin", value: "2", dot: "bg-energetic" },
                  { label: "Terlambat", value: "1", dot: "bg-draw" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className={`h-2 w-2 shrink-0 rounded-full ${item.dot}`} aria-hidden />
                      <span className="truncate text-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="shrink-0 font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-win" aria-hidden />
                <h3 className="font-semibold text-foreground">Tema latihan minggu ini</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-2">🎯 Fokus utama</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Akselerasi passing pendek (10 min)</li>
                    <li>• Power endurance circuit (25 min)</li>
                    <li>• Situasi pertandingan (20 min)</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="border-field/20 bg-field/5 text-field text-xs">Passing</Badge>
                <Badge variant="outline" className="border-energetic/20 bg-energetic/10 text-energetic-foreground text-xs">Conditioning</Badge>
                <Badge variant="outline" className="border-draw/20 bg-draw/5 text-draw text-xs">Tactic</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <DataState
          status={
            sessionsQuery.isLoading
              ? "loading"
              : sessionsQuery.isError
                ? "error"
                : trainingSessions.length === 0
                  ? "empty"
                  : "success"
          }
          errorMessage="Gagal memuat jadwal latihan."
          onRetry={() => void sessionsQuery.refetch()}
        >
          <TrainingSchedule sessions={trainingSessions} />
        </DataState>
      </main>
    </>
  );
}
