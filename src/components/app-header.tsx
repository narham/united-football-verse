import { useState } from "react";
import {
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CommandPalette } from "@/components/command-palette";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Bell,
  UserCircle2,
  LogOut,
  HelpCircle,
  ShieldHalf,
  CheckCircle2,
  ChevronDown,
  Calendar,
  Dumbbell,
} from "lucide-react";
import { club, clubs, type Club } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

function ClubSwitcher({
  current,
  onChange,
}: {
  current: Club;
  onChange: (c: Club) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="hidden items-center gap-2 h-9 md:inline-flex"
          aria-label={`Pilih klub. Saat ini: ${current.name}`}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-field text-[10px] font-bold text-field-foreground">
            {current.short.slice(0, 2)}
          </span>
          <span className="text-sm font-medium text-foreground max-w-[140px] truncate">
            {current.name}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Organisasi Aktif</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {clubs.map((c) => (
            <DropdownMenuItem
              key={c.id}
              onClick={() => onChange(c)}
              className="gap-2.5 cursor-pointer"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-field/15 text-[10px] font-bold text-field">
                {c.short.slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{c.name}</span>
                  {c.id === current.id && (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-field" aria-hidden />
                  )}
                </div>
                <span className="truncate text-xs text-muted-foreground">
                  {c.city} • {c.sport}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="gap-2.5 text-muted-foreground cursor-not-allowed">
          <Building2 className="h-4 w-4" aria-hidden />
          <span className="text-sm">+ Tambah organisasi (soon)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  let count: number = 3;
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label={`Notifikasi (${count} belum dibaca)`}
        >
          <Bell className="h-4.5 w-4.5" aria-hidden />
          <span
            className={cn(
              "absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-loss px-1 text-[10px] font-bold leading-none text-white",
              count === 0 && "hidden",
            )}
            aria-hidden
          >
            {count > 9 ? "9+" : count}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifikasi</span>
          <button
            type="button"
            className="text-xs font-medium text-field hover:underline"
            onClick={() => setOpen(false)}
          >
            Tandai semua dibaca
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-start gap-3 py-3 cursor-default focus:bg-transparent">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-win/15 text-win">
              <Dumbbell className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                Sesi latihan besok diubah
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Lapangan A → Lapangan B, 16:00 WIB
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">2 jam lalu</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-start gap-3 py-3 cursor-default focus:bg-transparent">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-energetic/20 text-energetic-foreground">
              <Calendar className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                Pertandingan baru terjadwal
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                GRD vs SSB Nusantara Muda — 16 Agu
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">1 hari lalu</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-start gap-3 py-3 cursor-default focus:bg-transparent">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-loss/15 text-loss">
              <ShieldHalf className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                Bayu Setiawan masuk daftar cedera
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Perkiraan pulih: 2 minggu lagi
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">3 hari lalu</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-muted-foreground text-xs justify-center cursor-not-allowed">
          Riwayat notifikasi lengkap (soon)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProfileMenu() {
  const user = {
    name: "Agus Setiawan",
    role: "Manager Klub",
    email: "agus.setiawan@garudamuda.id",
    initials: "AS",
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 h-9 px-2 md:px-3" aria-label="Menu profil pengguna">
          <Avatar className="h-7 w-7 shrink-0 ring-2 ring-field/20">
            <AvatarFallback className="bg-field text-xs font-bold text-field-foreground">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 flex-col items-start md:flex">
            <span className="w-full truncate text-sm font-medium leading-tight text-foreground">
              {user.name}
            </span>
            <span className="w-full truncate text-[11px] leading-tight text-muted-foreground">
              {user.role}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9 ring-2 ring-field/20">
              <AvatarFallback className="bg-field text-xs font-bold text-field-foreground">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2.5 cursor-pointer">
            <UserCircle2 className="h-4 w-4" aria-hidden />
            <span className="text-sm">Profil Saya</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2.5 cursor-pointer">
            <HelpCircle className="h-4 w-4" aria-hidden />
            <span className="text-sm">Pusat Bantuan</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="gap-2.5 text-loss cursor-not-allowed">
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="text-sm">Keluar (authentication belum aktif)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const [activeClub, setActiveClub] = useState<Club>(club);
  const [commandOpen, setCommandOpen] = useState(false);
  const breadcrumbs = useBreadcrumbs();

  return (
    <>
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border bg-card/50 px-4 py-2 md:px-6">
        <Breadcrumb>
          <BreadcrumbList className="text-sm">
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={crumb.href || index}>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="font-medium text-foreground">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink href={crumb.href} className="text-muted-foreground hover:text-foreground">
                      {crumb.label}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator className="mx-2" />
                  </>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur md:px-6">
        <SidebarTrigger className="shrink-0" aria-label="Toggle navigasi sidebar" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl leading-none text-foreground md:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 truncate text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <Badge
            variant="outline"
            className="gap-1.5 border-field/40 text-field md:hidden lg:inline-flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-field" aria-hidden />
            {activeClub.short} • {activeClub.city}
          </Badge>
          <span className="hidden text-sm font-medium text-muted-foreground md:inline">
            Musim {activeClub.season}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
          <ClubSwitcher current={activeClub} onChange={setActiveClub} />
          <NotificationBell />
          <ProfileMenu />
        </div>
      </header>
    </>
  );
}
