import { Activity, AlertTriangle, CalendarRange, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  {
    title: "Latihan minggu ini disetujui",
    detail: "Sesi Jumat dipindah ke Lapangan B untuk mengakomodasi cuaca.",
    time: "2 jam lalu",
    tone: "win" as const,
    icon: Sparkles,
  },
  {
    title: "Status cedera diperbarui",
    detail: "Bayu Setiawan dipindahkan ke pemantauan rehabilitasi selama 2 minggu.",
    time: "5 jam lalu",
    tone: "loss" as const,
    icon: AlertTriangle,
  },
  {
    title: "Pertandingan terjadwal",
    detail: "GRD dijadwalkan menghadapi SSB Nusantara Muda untuk opening musim.",
    time: "1 hari lalu",
    tone: "field" as const,
    icon: CalendarRange,
  },
  {
    title: "Audit data roster selesai",
    detail: "Kelengkapan Football ID dan status pemain telah diverifikasi.",
    time: "2 hari lalu",
    tone: "energetic" as const,
    icon: ShieldCheck,
  },
];

export function ActivityFeed() {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const Icon = item.icon;
        const toneClass = {
          win: "bg-win/10 text-win",
          loss: "bg-loss/10 text-loss",
          field: "bg-field/10 text-field",
          energetic: "bg-energetic/15 text-energetic-foreground",
        }[item.tone];

        return (
          <Card key={item.title} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                      {item.time}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
