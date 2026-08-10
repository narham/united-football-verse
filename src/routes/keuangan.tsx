import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { FinanceSummary } from "@/components/finance-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah, financeTotals } from "@/lib/demo-data";

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
  const totals = financeTotals();
  const healthStatus = totals.saldo >= 0 ? "Sehat" : "Perhatian";

  return (
    <>
      <AppHeader title="Keuangan" subtitle="Pemasukan, pengeluaran, dan saldo klub" />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {/* Financial Health Banner */}
        <div className={totals.saldo >= 0 ? "rounded-2xl border border-field/30 bg-field/5 p-5" : "rounded-2xl border border-loss/30 bg-loss/5 p-5"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className={totals.saldo >= 0 ? "h-6 w-6 text-field" : "h-6 w-6 text-loss"} aria-hidden />
              <div>
                <p className="text-sm text-muted-foreground">Status Keuangan Klub</p>
                <p className={totals.saldo >= 0 ? "font-display text-3xl text-foreground" : "font-display text-3xl text-loss"}>{formatRupiah(totals.saldo)}</p>
                <p className="text-xs text-muted-foreground mt-1">Saldo tersedia • {healthStatus}</p>
              </div>
            </div>
            <Badge className={totals.saldo >= 0 ? "bg-field/10 text-field border-field/20" : "bg-loss/10 text-loss border-loss/20"}>
              {healthStatus}
            </Badge>
          </div>
        </div>
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
