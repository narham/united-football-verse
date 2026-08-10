import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { FinanceSummary } from "@/components/finance-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/demo-data"; // Allowed: pure utility function
import { useFinanceTotals, useTransactions } from "@/hooks/useFinance";
import { useClub } from "@/hooks/useOrganization";
import { ErrorBanner } from "@/components/error-state";
import type { Club, Transaction } from "@/repositories/interfaces/types";

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
  const { data: club, isLoading: clubLoading } = useClub();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: totalsRaw, isLoading: totalsLoading, error, refetch } = useFinanceTotals();
  const totals = totalsRaw ?? { masuk: 0, keluar: 0, saldo: 0 };
  const healthStatus = totals.saldo >= 0 ? "Sehat" : "Perhatian";
  const isLoading = clubLoading || txLoading || totalsLoading;
  const clubName = club?.name ?? "SSB Garuda Muda";

  if (error) {
    return (
      <>
        <AppHeader title="Keuangan" subtitle={`Pemasukan, pengeluaran, dan saldo ${clubName}`} />
        <main className="flex-1 space-y-6 p-4 md:p-6">
          <ErrorBanner
            title="Gagal memuat ringkasan keuangan"
            description={(error as Error)?.message ?? "Silakan coba lagi."}
            onRetry={refetch}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Keuangan" subtitle={`Pemasukan, pengeluaran, dan saldo ${clubName}`} />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {/* Financial Health Banner */}
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ) : (
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
        )}
        {isLoading ? (
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-96 max-w-full" />
              </div>
            </CardContent>
          </Card>
        ) : (
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
        )}
        <FinanceSummary />
      </main>
    </>
  );
}
