import { createFileRoute } from "@tanstack/react-router";

import { ActivityFeed } from "@/components/activity-feed";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/aktivitas")({
  head: () => ({
    meta: [
      { title: "Aktivitas — bolaID Football OS" },
      { name: "description", content: "Timeline aktivitas demo dan audit operations" },
      { property: "og:title", content: "Aktivitas — bolaID Football OS" },
    ],
  }),
  component: AktivitasPage,
});

function AktivitasPage() {
  return (
    <>
      <AppHeader title="Aktivitas" subtitle="Timeline operasi, audit, dan perubahan penting" />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="font-display text-xl text-foreground">Aktivitas terbaru</p>
            <p className="mt-2 text-sm text-muted-foreground">Area ini menyiapkan pengalaman audit yang siap dipakai ketika backend event stream diaktifkan.</p>
          </CardContent>
        </Card>
        <ActivityFeed />
      </main>
    </>
  );
}
