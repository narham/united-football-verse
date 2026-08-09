import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { TrainingSchedule } from "@/components/training-schedule";
import { Button } from "@/components/ui/button";
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
          <Button className="gap-1.5 bg-field text-field-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Tambah Sesi
          </Button>
        </div>
        <TrainingSchedule />
      </main>
    </>
  );
}
