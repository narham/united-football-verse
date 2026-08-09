import { createFileRoute } from "@tanstack/react-router";
import { BellRing, CalendarClock, ShieldAlert, Sparkles } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const notifications = [
  { title: "Sesi latihan besok diubah", detail: "Lapangan A dipindah ke Lapangan B", time: "2 jam lalu", tone: "field" as const },
  { title: "Pertandingan baru terjadwal", detail: "GRD vs SSB Nusantara Muda", time: "1 hari lalu", tone: "energetic" as const },
  { title: "Peningkatan cedera", detail: "Bayu Setiawan perlu evaluasi", time: "3 hari lalu", tone: "loss" as const },
];

export const Route = createFileRoute("/notifikasi")({
  head: () => ({
    meta: [
      { title: "Notifikasi — bolaID Football OS" },
      { name: "description", content: "Pusat notifikasi demo untuk operasi klub." },
      { property: "og:title", content: "Notifikasi — bolaID Football OS" },
    ],
  }),
  component: NotifikasiPage,
});

function NotifikasiPage() {
  return (
    <>
      <AppHeader title="Notifikasi" subtitle="Pusat notifikasi demo untuk operasi klub" />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-field" aria-hidden />
              <h2 className="font-display text-xl text-foreground">Ringkasan pemberitahuan</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Semua pemberitahuan berikut adalah tampilan demo. Backend notifikasi akan menambahkan real-time, read/unread, dan prioritas.</p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {notifications.map((item) => {
            const toneClass = {
              field: "bg-field/10 text-field",
              energetic: "bg-energetic/15 text-energetic-foreground",
              loss: "bg-loss/10 text-loss",
            }[item.tone];
            return (
              <Card key={item.title} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
                        {item.tone === "loss" ? <ShieldAlert className="h-4 w-4" aria-hidden /> : item.tone === "energetic" ? <CalendarClock className="h-4 w-4" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                      {item.time}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
