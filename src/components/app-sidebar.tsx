import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Dumbbell, Trophy, Wallet, Settings, ShieldHalf } from "lucide-react";

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
import { club } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Pemain", url: "/pemain", icon: Users },
  { title: "Latihan", url: "/latihan", icon: Dumbbell },
  { title: "Kompetisi", url: "/kompetisi", icon: Trophy },
  { title: "Keuangan", url: "/keuangan", icon: Wallet },
  { title: "Pengaturan", url: "/pengaturan", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-field text-field-foreground">
            <ShieldHalf className="h-5 w-5" />
          </span>
          {!collapsed && (
            <span className="leading-tight">
              <span className="block font-display text-xl text-sidebar-foreground">
                bolaID
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-energetic">
                Football OS
              </span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup defaultOpen>
          <SidebarGroupLabel>Manajemen Klub</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2.5">
                      <item.icon className="h-4.5 w-4.5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export { cn };
