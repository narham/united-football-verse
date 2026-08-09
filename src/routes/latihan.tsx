import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Plus, Users2 } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { TrainingSchedule } from "@/components/training-schedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trainingSessions } from "@/lib/demo-data";

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
  return (
    <>
      <AppHeader title="Latihan" subtitle={`${trainingSessions.length} sesi per minggu`} />
      <main className="flex-1 space-y-4 p-4 md:p-6">
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
                <h2 className="font-display text-xl text-foreground">Attendance snapshot</h2>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Hadir", value: "17/20" },
                  { label: "Sakit/izin", value: "2" },
                  { label: "Terlambat", value: "1" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-win" aria-hidden />
                <h2 className="font-display text-xl text-foreground">Catatan sesi minggu ini</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Fokus minggu ini: akselerasi passing pendek dan penguatan fisik power endurance.</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-field/20 bg-field/5 text-field">Passing</Badge>
                  <Badge variant="outline" className="border-energetic/20 bg-energetic/10 text-energetic-foreground">Conditioning</Badge>
                  <Badge variant="outline" className="border-draw/20 bg-draw/5 text-draw">Recovery</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <TrainingSchedule />
      </main>
    </>
  );
}
