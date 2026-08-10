import { createFileRoute } from "@tanstack/react-router";
import { ShieldHalf, Moon, Sun, Palette, Monitor, Info, Package, Database } from "lucide-react";
import { useState } from "react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBanner } from "@/components/error-state";
import { useClub } from "@/hooks/useOrganization";
import { useStaff } from "@/hooks/useStaff";

export const Route = createFileRoute("/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan — bolaID Football OS" },
      {
        name: "description",
        content: "Profil dan pengaturan klub SSB Garuda Muda.",
      },
      { property: "og:title", content: "Pengaturan — bolaID Football OS" },
      {
        property: "og:description",
        content: "Profil klub & preferensi Football OS bolaID.",
      },
    ],
  }),
  component: PengaturanPage,
});

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && (
        <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>
      )}
    </div>
  );
}

function PengaturanPage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const { data: club, isLoading: clubLoading, error: clubError, refetch: refetchClub } = useClub();
  const { data: staff = [], isLoading: staffLoading, error: staffError, refetch: refetchStaff } = useStaff();
  const isLoading = clubLoading || staffLoading;
  const error = clubError || staffError;
  const refetch = () => { refetchClub(); refetchStaff(); };

  const applyTheme = (mode: "light" | "dark" | "system") => {
    setTheme(mode);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (mode === "dark") {
      root.classList.add("dark");
    } else if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
    }
  };

  if (error) {
    return (
      <>
        <AppHeader
          title="Pengaturan"
          subtitle="Profil klub, preferensi antarmuka, & info sistem Football OS"
        />
        <main className="flex-1 space-y-6 p-4 md:p-6">
          <ErrorBanner
            title="Gagal memuat data pengaturan"
            description={(error as Error)?.message ?? "Silakan coba lagi."}
            onRetry={refetch}
          />
        </main>
      </>
    );
  }

  const clubName = club?.name ?? "SSB Garuda Muda";
  const clubShort = club?.short ?? "GRD";
  const clubCity = club?.city ?? "Bandung";
  const clubFounded = club?.foundedYear ?? 2012;
  const clubSeason = club?.season ?? "2026/2027";
  const clubSport = club?.sport ?? "Sepak Bola";
  const clubOrgId = club?.footballOrgId ?? "ASPJABAR-SSB-0127";

  return (
    <>
      <AppHeader
        title="Pengaturan"
        subtitle="Profil klub, preferensi antarmuka, & info sistem Football OS"
      />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {/* §15 — Club Profile */}
        <section aria-label="Profil Klub" className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-field text-field-foreground shadow-md ring-2 ring-field/20">
              <ShieldHalf className="h-8 w-8" aria-hidden />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl text-foreground">
                  {isLoading ? <Skeleton className="h-7 w-48 inline-block align-middle" /> : clubName}
                </h2>
                {!isLoading && (
                  <Badge variant="outline" className="bg-field/5 border-field/30 text-field">
                    {clubOrgId}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoading ? (
                  <Skeleton className="h-4 w-80 max-w-full" />
                ) : (
                  <>
                    {clubCity} • Berdiri {clubFounded} • Musim {clubSeason} •{" "}
                    {clubSport}
                  </>
                )}
              </p>
            </div>
          </div>
          <Separator className="my-5" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nama Klub">
              <Input defaultValue={clubName} />
            </Field>
            <Field label="Singkatan / Kode">
              <Input defaultValue={clubShort} />
            </Field>
            <Field label="Kota Domisili">
              <Input defaultValue={clubCity} />
            </Field>
            <Field label="Tahun Berdiri">
              <Input defaultValue={String(clubFounded)} />
            </Field>
            <Field label="Musim Aktif">
              <Input defaultValue={clubSeason} />
            </Field>
            <Field label="Cabang Olahraga (Sport)">
              <Input defaultValue={clubSport} />
            </Field>
            <Field
              label="ID Organisasi (FSSI / Asprov)"
              hint="Football ID referensi ke induk organisasi (backend mendatang)"
            >
              <Input defaultValue={clubOrgId} />
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="outline">Batal</Button>
            <Button className="bg-field text-field-foreground hover:opacity-90">
              Simpan Perubahan
            </Button>
          </div>
        </section>

        {/* §15 — Interface (dark/light mode + preferences) */}
        <section aria-label="Pengaturan Antarmuka" className="rounded-2xl border border-border bg-card p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl text-foreground">Antarmuka</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Preferensi tampilan Football OS
              </p>
            </div>
            <Palette className="h-5 w-5 text-muted-foreground" aria-hidden />
          </div>
          <Separator />

          {/* Theme Selector */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-3 block">
              Mode Tampilan
            </Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {([
                { k: "light", label: "Terang", Icon: Sun, desc: "Selalu mode terang" },
                { k: "dark", label: "Gelap", Icon: Moon, desc: "Selalu mode gelap" },
                { k: "system", label: "Sistem", Icon: Monitor, desc: "Ikuti pengaturan sistem" },
              ] as const).map(({ k, label, Icon, desc }) => {
                const active = theme === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => applyTheme(k)}
                    aria-pressed={active}
                    className={
                      "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors " +
                      (active
                        ? "border-field/50 bg-field/5 ring-1 ring-field/30"
                        : "border-border bg-card hover:border-field/30")
                    }
                  >
                    <span
                      className={
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " +
                        (active
                          ? "bg-field text-field-foreground"
                          : "bg-muted text-muted-foreground")
                      }
                    >
                      <Icon className="h-4.5 w-4.5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic preferences switches — CAP-ORG-002 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">Animasi transisi</p>
                <p className="text-xs text-muted-foreground">Aktifkan efek hover dan transisi halus</p>
              </div>
              <Switch defaultChecked aria-label="Aktifkan animasi" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">Notifikasi push</p>
                <p className="text-xs text-muted-foreground">Pengingat latihan & pertandingan (soon)</p>
              </div>
              <Switch disabled aria-label="Aktifkan notifikasi push — belum tersedia" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">Kepadatan tabel ringkas</p>
                <p className="text-xs text-muted-foreground">Row height lebih pendek untuk roster besar</p>
              </div>
              <Switch aria-label="Kepadatan tabel ringkas" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">Format tanggal Indonesia</p>
                <p className="text-xs text-muted-foreground">DD/MM/YYYY dan nama bulan Bahasa</p>
              </div>
              <Switch defaultChecked aria-label="Gunakan format tanggal Indonesia" />
            </div>
          </div>
        </section>

        {/* §15 — System info */}
        <section
          aria-label="Informasi sistem bolaID"
          className="rounded-2xl border border-border bg-card p-5 space-y-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl text-foreground">Sistem</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Informasi build & status platform bolaID
              </p>
            </div>
            <Info className="h-5 w-5 text-muted-foreground" aria-hidden />
          </div>
          <Separator />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-field/10 text-field">
                    <ShieldHalf className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">bolaID</p>
                    <p className="font-display text-lg text-foreground">
                      Football OS
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="mt-3 border-field/30 bg-field/5 text-field">
                  v1.0.0 Frontend Demo
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-energetic/15 text-energetic-foreground">
                    <Package className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Mode Data
                    </p>
                    <p className="font-semibold text-foreground">Frontend Demo Mode</p>
                  </div>
                </div>
                <Badge variant="outline" className="mt-3 border-draw/30 bg-draw/5 text-draw">
                  demo-data.ts (lokal)
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-win/10 text-win">
                    <Database className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Backend
                    </p>
                    <p className="font-semibold text-foreground">Belum Aktif</p>
                  </div>
                </div>
                <Badge variant="outline" className="mt-3 border-loss/30 bg-loss/5 text-loss">
                  Supabase — pending aktivasi
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Modul Ekosistem bolaID — tetap ada, dipercantik dengan badges */}
          <div>
            <h3 className="font-display text-xl text-foreground mb-3">
              Modul Ekosistem bolaID
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-between rounded-lg bg-field/5 px-3 py-2.5 ring-1 ring-field/20">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <ShieldHalf className="h-4 w-4 text-field" aria-hidden />
                  Football OS
                </span>
                <Badge className="bg-field text-field-foreground">AKTIF</Badge>
              </li>
              {[
                { k: "Football ID", d: "Identitas sepak bola lintas klub" },
                { k: "Competition Platform", d: "Manajemen liga & turnamen" },
                { k: "Development Engine", d: "Kurikulum & pengembangan pemain" },
                { k: "Football Intelligence", d: "Analitik & scouting data" },
              ].map((m) => (
                <li
                  key={m.k}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-muted-foreground">
                      {m.k}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                      {m.d}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-muted-foreground border-border">
                    Segera
                  </Badge>
                </li>
              ))}
            </ul>
          </div>

          {/* Staff count quick info — CAP-ORG-003 visibility */}
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Staf Terdaftar (CAP-ORG-003)
            </p>
            {isLoading ? (
              <div className="mt-1.5 space-y-2">
                <Skeleton className="h-8 w-28" />
                <div className="flex flex-wrap gap-1.5">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-28 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </div>
            ) : (
              <>
                <p className="mt-1.5 font-display text-2xl text-foreground">
                  {staff.length} orang
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {staff.slice(0, 4).map((s) => (
                    <Badge key={s.id} variant="outline" className="text-xs">
                      {s.role}
                    </Badge>
                  ))}
                  {staff.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{staff.length - 4} lainnya
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
