import { Clock, MapPin, Users } from "lucide-react";
import type { TrainingSession } from "@/repositories/interfaces/types";
import { Button } from "@/components/ui/button";

function TrainingSessionRow({ t }: { t: TrainingSession }) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-field/40"
    >
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-field font-display text-field-foreground">
        <span className="text-[10px] uppercase leading-none opacity-80">Hari</span>
        <span className="text-base leading-none">{t.day.slice(0, 3)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{t.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{t.focus}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {t.startTime}–{t.endTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {t.location}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="hidden shrink-0 gap-1 sm:inline-flex"
        aria-label={`Lihat kehadiran sesi ${t.title}`}
      >
        <Users className="h-3.5 w-3.5" aria-hidden />
        Kehadiran
      </Button>
    </div>
  );
}

export function TrainingSchedule({
  sessions,
}: {
  sessions: TrainingSession[];
}) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12 text-center">
        <Clock className="h-10 w-10 text-muted-foreground" aria-hidden />
        <p className="mt-3 font-medium text-foreground">
          Tidak ada sesi latihan terjadwal
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan sesi latihan baru untuk memulai.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Jadwal latihan">
      {sessions.map((t) => (
        <div key={t.id} role="listitem">
          <TrainingSessionRow t={t} />
        </div>
      ))}
    </div>
  );
}

export { TrainingSessionRow };
