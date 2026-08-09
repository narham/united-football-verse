import { Clock, MapPin } from "lucide-react";
import { trainingSessions } from "@/lib/demo-data";

export function TrainingSchedule() {
  return (
    <div className="space-y-3">
      {trainingSessions.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-field/40"
        >
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-field font-display text-card-foreground text-field-foreground">
            <span className="text-[10px] uppercase leading-none opacity-80">Hari</span>
            <span className="text-base leading-none">{t.hari.slice(0, 3)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{t.fokus}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {t.jamMulai}–{t.jamSelesai}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {t.lokasi}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
