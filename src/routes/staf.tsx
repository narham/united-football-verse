import { createFileRoute } from "@tanstack/react-router";
import { Phone, ShieldCheck, Sparkles, UserRound } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { staff } from "@/lib/demo-data";

export const Route = createFileRoute("/staf")({
  head: () => ({
    meta: [
      { title: "Staf — bolaID Football OS" },
      { name: "description", content: "Daftar staf dan kontak operasional SSB Garuda Muda." },
      { property: "og:title", content: "Staf — bolaID Football OS" },
    ],
  }),
  component: StafPage,
});

function StafPage() {
  return (
    <>
      <AppHeader title="Staf" subtitle="Tim pelatih, staff, dan kontak operasional" />
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <section className="grid gap-3 lg:grid-cols-3">
          <Card className="border-field/30 bg-field/5">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-field">Tim aktif</p>
              <p className="mt-2 font-display text-3xl text-foreground">{staff.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">Pelatih, manager, dan support operasi</p>
            </CardContent>
          </Card>
          <Card className="border-energetic/30 bg-energetic/10">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-energetic-foreground">Kecepatan koordinasi</p>
              <p className="mt-2 font-display text-3xl text-foreground">4/5</p>
              <p className="mt-1 text-sm text-muted-foreground">Dashboard demo menandai prioritas minggu ini</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Mode data</p>
              <p className="mt-2 font-display text-3xl text-foreground">Demo</p>
              <p className="mt-1 text-sm text-muted-foreground">Kontak dan role siap dipasang ke backend saat aktif</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {staff.map((person) => (
            <Card key={person.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{person.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{person.role}</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <UserRound className="h-5 w-5" aria-hidden />
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-field/20 bg-field/5 text-field">
                    <ShieldCheck className="mr-1 h-3 w-3" aria-hidden />
                    Operasional aktif
                  </Badge>
                  <Badge variant="outline" className="border-energetic/20 bg-energetic/10 text-energetic-foreground">
                    <Sparkles className="mr-1 h-3 w-3" aria-hidden />
                    Ready for handoff
                  </Badge>
                </div>
                {person.telephone && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" aria-hidden />
                    <span>{person.telephone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </>
  );
}
