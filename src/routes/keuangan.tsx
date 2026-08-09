import { createFileRoute } from "@tanstack/react-router";

import { AppHeader } from "@/components/app-header";
import { FinanceSummary } from "@/components/finance-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/keuangan")({
  head: () => ({
    meta: [
      { title: "Keuangan — bolaID Football OS" },
      { name: "description", content: "Ringkasan keuangan, SPP, dan transaksi SSB Garuda Muda." },
      { property: "og:title", content: "Keuangan — bolaID Football OS" },
      { property: "og:description", content: "Ringkasan keuangan dan transaksi SSB Garuda Muda." },
    ],
  }),
  component: KeuanganPage,
});

function KeuanganPage() {
  return (
    <>
      <AppHeader title="Keuangan" subtitle="Pemasukan, pengeluaran, dan saldo klub" />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl text-foreground">Overview bulanan</p>
                <p className="mt-1 text-sm text-muted-foreground">Paket demo menampilkan aliran operasional dan progress financial readiness.</p>
              </div>
              <Badge variant="outline" className="border-field/20 bg-field/5 text-field">Demo mode</Badge>
            </div>
          </CardContent>
        </Card>
        <FinanceSummary />
      </main>
    </>
  );
}
