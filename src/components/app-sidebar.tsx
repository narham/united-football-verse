import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BellRing,
  CalendarDays,
  Dumbbell,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ShieldHalf,
  Trophy,
  Users,
  Users2,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { club, players, trainingSessions } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

// Menu items organized by section
const menuSections = [
  {
    title: "OVERVIEW",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    title: "PEOPLE",
    items: [
      { title: "Pemain", url: "/pemain", icon: Users, badge: () => players.filter(p => p.status === "Aktif").length },
      { title: "Staf", url: "/staf", icon: ShieldCheck },
    ],
  },
  {
    title: "SPORT",
    items: [
      { title: "Tim", url: "/tim", icon: Users2 },
      { title: "Latihan", url: "/latihan", icon: Dumbbell, badge: () => trainingSessions.length },
      { title: "Kompetisi", url: "/kompetisi", icon: Trophy },
      { title: "Musim", url: "/musim", icon: CalendarDays },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { title: "Keuangan", url: "/keuangan", icon: Wallet },
      { title: "Notifikasi", url: "/notifikasi", icon: BellRing, badge: () => 3 },
      { title: "Aktivitas", url: "/aktivitas", icon: Activity },
    ],
  },
  {
    title: "SYSTEM",
    items: [{ title: "Pengaturan", url: "/pengaturan", icon: Settings }],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Header with Logo and Organization Info */}
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-field text-field-foreground">
            <ShieldHalf className="h-5 w-5" />
          </span>
          {!collapsed && (
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="block font-display text-xl text-sidebar-foreground leading-tight">
                bolaID
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-energetic">
                Football OS
              </span>
            </div>
          )}
        </Link>

        {/* Organization Info - shown when not collapsed */}
        {!collapsed && (
          <div className="mt-4 pt-4 border-t border-sidebar-border/50">
            <div className="text-xs">
              <p className="font-semibold text-sidebar-foreground truncate">{club.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {club.city} • {club.sport}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Manager • {club.season}
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation Menu with Sections */}
      <SidebarContent>
        {menuSections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel 
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 px-2 py-1.5"
              aria-label={`${section.title} - Navigation section`}
            >
              {!collapsed && section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu role="navigation" aria-label={`${section.title} navigation`}>
                {section.items.map((item) => {
                  const badgeValue = item.badge ? item.badge() : undefined;
                  const ariaLabel = badgeValue !== undefined && badgeValue > 0 
                    ? `${item.title}, ${badgeValue} items`
                    : item.title;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive(item.url)}
                        aria-label={ariaLabel}
                        aria-current={isActive(item.url) ? "page" : undefined}
                      >
                        <Link to={item.url} className="flex items-center gap-2.5" title={item.title}>
                          <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
                          <span className="flex-1">{item.title}</span>
                          {!collapsed && badgeValue !== undefined && badgeValue > 0 && (
                            <Badge 
                              variant="secondary" 
                              className="ml-auto text-[10px] font-semibold"
                              aria-label={`${badgeValue} items`}
                            >
                              {badgeValue > 99 ? "99+" : badgeValue}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export { cn };
