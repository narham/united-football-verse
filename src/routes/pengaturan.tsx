import { createFileRoute } from "@tanstack/react-router";
import { ShieldHalf } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { club } from "@/lib/demo-data";

export const Route = createFileRoute("/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan — bolaID Football OS" },
      { name: "description", content: "Profil dan pengaturan klub SSB Garuda Muda." },
      { property: "og:title", content: "Pengaturan — bolaID Football OS" },
      { property: "og:description", content: "Profil dan pengaturan klub SSB Garuda Muda." },
    ],
  }),
  component: PengaturanPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function PengaturanPage() {
  return (
    <>
      <AppHeader title="Pengaturan" subtitle="Profil klub & preferensi Football OS" />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-field text-field-foreground">
              <ShieldHalf className="h-8 w-8" />
            </span>
            <div>
              <h2 className="font-display text-2xl text-foreground">{club.name}</h2>
              <p className="text-sm text-muted-foreground">{club.city} • Berdiri {club.foundedYear} • Musim {club.season}</p>
            </div>
          </div>
          <Separator className="my-5" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama Klub"><Input defaultValue={club.name} /></Field>
            <Field label="Singkatan"><Input defaultValue={club.short} /></Field>
            <Field label="Kota"><Input defaultValue={club.city} /></Field>
            <Field label="Tahun Berdiri"><Input defaultValue={String(club.foundedYear)} /></Field>
            <Field label="Musim Aktif"><Input defaultValue={club.season} /></Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline">Batal</Button>
            <Button className="bg-field text-field-foreground hover:opacity-90">Simpan Perubahan</Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-xl text-foreground">Modul Ekosistem bolaID</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Football OS adalah modul pertama. Modul berikut akan aktif bertahap.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-lg bg-field/5 px-3 py-2.5">
              <span className="font-medium text-foreground">Football OS</span>
              <span className="text-xs font-semibold uppercase text-field">Aktif</span>
            </li>
            {["Football ID", "Competition Platform", "Development Engine", "Football Intelligence"].map((m) => (
              <li key={m} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                <span className="font-medium text-muted-foreground">{m}</span>
                <span className="text-xs font-semibold uppercase text-muted-foreground">Segera</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
