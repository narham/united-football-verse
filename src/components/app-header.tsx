import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { club } from "@/lib/demo-data";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur md:px-6">
      <SidebarTrigger className="shrink-0" />
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl leading-none text-foreground md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 truncate text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="hidden items-center gap-3 sm:flex">
        <Badge variant="outline" className="gap-1.5 border-field/40 text-field">
          <span className="h-1.5 w-1.5 rounded-full bg-field" />
          {club.short} • {club.city}
        </Badge>
        <span className="text-sm font-medium text-muted-foreground">Musim {club.season}</span>
      </div>
    </header>
  );
}
