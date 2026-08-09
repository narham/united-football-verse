import { useRouterState } from "@tanstack/react-router";
import { useMemo } from "react";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  "/": [{ label: "Dashboard", href: "/" }],
  "/pemain": [
    { label: "Dashboard", href: "/" },
    { label: "Pemain", href: "/pemain" },
  ],
  "/pemain/$id": [
    { label: "Dashboard", href: "/" },
    { label: "Pemain", href: "/pemain" },
    { label: "Profil", href: "#" },
  ],
  "/latihan": [
    { label: "Dashboard", href: "/" },
    { label: "Latihan", href: "/latihan" },
  ],
  "/latihan/$id": [
    { label: "Dashboard", href: "/" },
    { label: "Latihan", href: "/latihan" },
    { label: "Detail", href: "#" },
  ],
  "/kompetisi": [
    { label: "Dashboard", href: "/" },
    { label: "Kompetisi", href: "/kompetisi" },
  ],
  "/kompetisi/$id": [
    { label: "Dashboard", href: "/" },
    { label: "Kompetisi", href: "/kompetisi" },
    { label: "Pertandingan", href: "#" },
  ],
  "/keuangan": [
    { label: "Dashboard", href: "/" },
    { label: "Keuangan", href: "/keuangan" },
  ],
  "/keuangan/$id": [
    { label: "Dashboard", href: "/" },
    { label: "Keuangan", href: "/keuangan" },
    { label: "Detail", href: "#" },
  ],
  "/pengaturan": [
    { label: "Dashboard", href: "/" },
    { label: "Pengaturan", href: "/pengaturan" },
  ],
  "/staf": [
    { label: "Dashboard", href: "/" },
    { label: "Staf", href: "/staf" },
  ],
  "/tim": [
    { label: "Dashboard", href: "/" },
    { label: "Tim", href: "/tim" },
  ],
  "/tim/$id": [
    { label: "Dashboard", href: "/" },
    { label: "Tim", href: "/tim" },
    { label: "Detail", href: "#" },
  ],
  "/musim": [
    { label: "Dashboard", href: "/" },
    { label: "Musim", href: "/musim" },
  ],
  "/notifikasi": [
    { label: "Dashboard", href: "/" },
    { label: "Notifikasi", href: "/notifikasi" },
  ],
  "/aktivitas": [
    { label: "Dashboard", href: "/" },
    { label: "Aktivitas", href: "/aktivitas" },
  ],
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return useMemo(() => {
    // Try exact route match first
    if (routeBreadcrumbs[pathname]) {
      return routeBreadcrumbs[pathname];
    }

    // Try parent route patterns
    for (const [route, crumbs] of Object.entries(routeBreadcrumbs)) {
      if (route === "/" || route === pathname) continue;
      
      const pattern = route.replace(/\$\w+/g, "[^/]+");
      const regex = new RegExp(`^${pattern}$`);
      
      if (regex.test(pathname)) {
        return crumbs;
      }
    }

    // Fallback to dashboard
    return [{ label: "Dashboard", href: "/" }];
  }, [pathname]);
}
