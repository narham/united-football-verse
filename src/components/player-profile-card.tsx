import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PositionBadge, StatusBadge } from "@/components/position-badge";
import { DefaultEmptyState } from "@/components/data-state";
import { PlayerIdentitySection } from "@/components/player-identity-section";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  CalendarDays,
  Dumbbell,
  Trophy,
  Activity,
  Footprints,
  Target,
  Users2,
  Clock,
} from "lucide-react";
import {
  usia,
  seasonStatsTotal,
  playerPerformanceRating,
  club,
  type Player,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

// ============== Performance Summary Card ==============
function PerformanceSummary({ player }: { player: Player }) {
  const rating = playerPerformanceRating(player);
  const current = seasonStatsTotal(player);
  const per90 = (n: number) => {
    const base = current.minutes / 90 || 1;
    return (n / base).toFixed(2);
  };

  const gradeColor: Record<string, string> = {
    A: "text-win bg-win/10 ring-win/30",
    B: "text-field bg-field/10 ring-field/30",
    C: "text-draw bg-draw/10 ring-draw/30",
    D: "text-slate-600 dark:text-slate-300 bg-slate-500/10 ring-slate-500/30",
    E: "text-loss bg-loss/10 ring-loss/30",
    "-": "text-muted-foreground bg-muted ring-border",
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Rating Performa
              </p>
              <p className="mt-2 font-display text-3xl text-foreground">
                {rating.score ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{rating.label}</p>
            </div>
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl font-display text-xl ring-1",
                gradeColor[rating.grade],
              )}
            >
              {rating.grade}
            </span>
          </div>
          <Progress
            value={rating.score}
            className="mt-3 h-1.5 [&>div]:bg-field"
            aria-label={`Skor performa ${rating.score}%`}
          />
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Kontribusi / 90 Menit
              </p>
              <p className="mt-2 font-display text-2xl text-foreground">
                <span className="text-field">{per90(current.goals)}G</span>
                <span className="mx-1.5 text-muted-foreground">·</span>
                <span className="text-energetic-foreground bg-energetic/20 px-1 rounded">
                  {per90(current.assists)}A
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {current.minutes.toLocaleString("id-ID")} menit musim ini
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-field/10 text-field">
              <Target className="h-5 w-5" aria-hidden />
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Penampilan
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="font-display text-2xl text-foreground">{current.apps}</p>
                <span className="text-xs text-muted-foreground">pertandingan</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Total: {current.goals} gol · {current.assists} assist
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-energetic/15 text-energetic-foreground">
              <Footprints className="h-5 w-5" aria-hidden />
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Klub
              </p>
              <p className="mt-2 font-semibold text-foreground">{club.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {club.season} · #{player.nomor}
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-win/10 text-win">
              <Users2 className="h-5 w-5" aria-hidden />
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============== Season Statistics Table ==============
function SeasonStatsTable({ player }: { player: Player }) {
  if (!player.stats || player.stats.length === 0) {
    return (
      <DefaultEmptyState
        icon={Trophy}
        title="Belum ada statistik musim"
        description="Statistik akan muncul setelah pemain memainkan pertandingan resmi."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Musim</TableHead>
          <TableHead className="text-center">Main</TableHead>
          <TableHead className="text-center">Gol</TableHead>
          <TableHead className="text-center">Assist</TableHead>
          <TableHead className="text-center">Menit</TableHead>
          <TableHead className="hidden sm:table-cell text-center">Gol/90</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {player.stats.map((s) => {
          const per90 = ((s.minutes / 90) || 1);
          const g90 = (s.goals / per90).toFixed(2);
          return (
            <TableRow key={s.season}>
              <TableCell className="font-medium">{s.season}</TableCell>
              <TableCell className="text-center">{s.apps}</TableCell>
              <TableCell className="text-center font-semibold text-field">
                {s.goals}
              </TableCell>
              <TableCell className="text-center">{s.assists}</TableCell>
              <TableCell className="text-center text-muted-foreground">
                {s.minutes.toLocaleString("id-ID")}&apos;
              </TableCell>
              <TableCell className="hidden sm:table-cell text-center text-xs text-muted-foreground">
                {g90}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ============== Recent Activity (Empty Professional State per §11) ==============
function RecentActivity() {
  return (
    <DefaultEmptyState
      icon={Activity}
      title="Riwayat aktivitas akan tersedia"
      description="Setelah backend aktif, bagian ini akan menampilkan catatan latihan, menit bermain, perubahan status cedera, dan event lainnya dalam bentuk timeline."
    />
  );
}

// ============== Training & Competition History (Empty Professional State per §11) ==============
function HistoryTabs({ player }: { player: Player }) {
  const _ = player; // kept for future use (avoids unused param warning but allows type-check)
  void _;
  return (
    <Tabs defaultValue="training" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="training" className="gap-1.5">
          <Dumbbell className="h-3.5 w-3.5" aria-hidden /> Latihan
        </TabsTrigger>
        <TabsTrigger value="competition" className="gap-1.5">
          <Trophy className="h-3.5 w-3.5" aria-hidden /> Kompetisi
        </TabsTrigger>
      </TabsList>
      <TabsContent value="training" className="mt-4">
        <DefaultEmptyState
          icon={Dumbbell}
          title="Riwayat kehadiran latihan"
          description="Modul attendance akan mencatat status kehadiran per sesi. Fitur ini aktif setelah backend attendance diimplementasikan."
        />
      </TabsContent>
      <TabsContent value="competition" className="mt-4">
        <DefaultEmptyState
          icon={Trophy}
          title="Riwayat pertandingan per pemain"
          description="Per pertandingan: starter/substitute, menit bermain, gol/assist, kartu. Fitur line-up akan tersedia di modul Competition Platform."
        />
      </TabsContent>
    </Tabs>
  );
}

// ============== Main PlayerProfileCard ==============
export function PlayerProfileCard({ player }: { player: Player }) {
  const born = new Date(player.tanggalLahir).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="pitch-lines h-24 bg-field/5" aria-hidden />
        <div className="flex flex-col gap-4 px-5 pb-5 pt-1 sm:flex-row sm:items-end">
          <span className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-field font-display text-4xl text-field-foreground ring-4 ring-card shadow-lg sm:h-24 sm:w-24 sm:text-5xl">
            {player.nomor}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 border-field/40 bg-field/5 text-field"
              >
                <ShieldCheck className="h-3 w-3" aria-hidden />
                <span className="font-mono text-[11px] tracking-wide">
                  {player.football_id}
                </span>
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                Football ID — identitas stabil
              </span>
            </div>
            <h2 className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-4xl">
              {player.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PositionBadge posisi={player.posisi} />
              <StatusBadge status={player.status} />
              <Badge variant="outline" className="gap-1 border-border bg-muted/40 text-muted-foreground">
                <CalendarDays className="h-3 w-3" aria-hidden />
                {born} · {usia(player.tanggalLahir)} tahun
              </Badge>
              <Badge variant="outline" className="gap-1 border-border bg-muted/40 text-muted-foreground">
                #{player.nomor}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Biodata Ringkas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Tinggi", v: `${player.tinggi} cm` },
          { l: "Berat", v: `${player.berat} kg` },
          { l: "Kaki Utama", v: player.kaki },
          { l: "Klub Saat Ini", v: club.short },
        ].map((x) => (
          <div key={x.l} className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {x.l}
            </p>
            <p className="mt-1 font-medium text-foreground">{x.v}</p>
          </div>
        ))}
      </div>

      <Separator className="my-1" />

      {/* Performance Summary (CAP-ANL-002) */}
      <section aria-label="Ringkasan performa pemain">
        <h3 className="font-display text-xl text-foreground mb-3">
          Ringkasan Performa
        </h3>
        <PerformanceSummary player={player} />
      </section>

      {/* Identity & Citizenship Section */}
      <section aria-label="Identitas dan kewarganegaraan pemain">
        <PlayerIdentitySection player={player} />
      </section>

      {/* Season Stats Tab */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h3 className="font-display text-xl text-foreground">Statistik per Musim</h3>
          <Badge variant="outline" className="text-xs">
            CAP-ANL-002
          </Badge>
        </div>
        <SeasonStatsTable player={player} />
      </div>

      {/* Recent Activity (timeline placeholder) */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h3 className="font-display text-xl text-foreground">Aktivitas Terbaru</h3>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Timeline
          </Badge>
        </div>
        <div className="p-4">
          <RecentActivity />
        </div>
      </div>

      {/* Training / Competition History Tabs */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h3 className="font-display text-xl text-foreground">
            Riwayat Latihan & Kompetisi
          </h3>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            CAP-TRN-003 · CAP-CMP-003
          </Badge>
        </div>
        <div className="p-4">
          <HistoryTabs player={player} />
        </div>
      </div>
    </div>
  );
}
