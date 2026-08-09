import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BellRing,
  Command,
  Dumbbell,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Trophy,
  Users2,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchEntry {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const entries: SearchEntry[] = [
  { title: "Dashboard", description: "Ringkasan operasional klub", href: "/", icon: LayoutDashboard },
  { title: "Pemain", description: "Roster, status, dan profil pemain", href: "/pemain", icon: Users2 },
  { title: "Latihan", description: "Jadwal sesi & attendance snapshot", href: "/latihan", icon: Dumbbell },
  { title: "Kompetisi", description: "Fixture, hasil, dan standing", href: "/kompetisi", icon: Trophy },
  { title: "Keuangan", description: "Saldo, transaksi, dan budget", href: "/keuangan", icon: Wallet },
  { title: "Staf", description: "Daftar pelatih dan administrasi", href: "/staf", icon: ShieldCheck },
  { title: "Notifikasi", description: "Pusat notifikasi demo", href: "/notifikasi", icon: BellRing },
  { title: "Aktivitas", description: "Timeline operasi & audit trail", href: "/aktivitas", icon: Activity },
  { title: "Pengaturan", description: "Preferensi klub & sistem", href: "/pengaturan", icon: Settings },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) =>
      [entry.title, entry.description].some((value) => value.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="hidden h-9 items-center gap-2 rounded-full border-border/70 bg-background/60 px-3 text-sm text-muted-foreground md:inline-flex"
        onClick={() => onOpenChange(true)}
      >
        <Search className="h-4 w-4" aria-hidden />
        Cari cepat
        <span className="ml-1 hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide lg:inline-flex">
          Ctrl+K
        </span>
      </Button>

      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput
          placeholder="Cari menu, fitur, atau halaman..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>Tidak ada hasil yang cocok.</CommandEmpty>
          <CommandGroup heading="Navigasi cepat">
            {filtered.map((entry) => {
              const Icon = entry.icon;
              return (
                <CommandItem
                  key={entry.href}
                  value={`${entry.title} ${entry.description}`}
                  onSelect={() => {
                    router.navigate({ to: entry.href });
                    onOpenChange(false);
                    setQuery("");
                  }}
                  className="cursor-pointer"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <div className="flex flex-col">
                    <span className="font-medium">{entry.title}</span>
                    <span className="text-xs text-muted-foreground">{entry.description}</span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandGroup heading="Aksi cepat">
            <CommandItem
              value="shortcut command"
              onSelect={() => {
                onOpenChange(false);
                setQuery("");
              }}
              className="cursor-pointer"
            >
              <Command className="h-4 w-4" aria-hidden />
              <div className="flex flex-col">
                <span className="font-medium">Buka command palette</span>
                <span className="text-xs text-muted-foreground">Fitur demo untuk navigasi cepat</span>
              </div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
