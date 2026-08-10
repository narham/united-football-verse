import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/demo-data"; // Allowed: pure utility function
import { useTransaction } from "@/hooks/useFinance";
import { ErrorBanner } from "@/components/error-state";
import type { Transaction } from "@/repositories/interfaces/types";

export const Route = createFileRoute("/keuangan/$id")({
  head: () => ({
    meta: [
      { title: "Detail Transaksi — bolaID Football OS" },
      { name: "description", content: "Detail transaksi keuangan klub." },
      { property: "og:title", content: "Detail Transaksi — bolaID Football OS" },
    ],
  }),
  component: FinanceDetailPage,
});

function FinanceDetailPage() {
  const params = Route.useParams();
  const { data: transaction, isLoading, error } = useTransaction(params.id);

  if (isLoading) {
    return (
      <>
        <AppHeader title="Detail Transaksi" subtitle="Memuat transaksi..." />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link to="/keuangan" className="hover:text-field">Keuangan</Link>
            <ChevronRight className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </nav>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/keuangan"><ArrowLeft className="h-4 w-4" /> Kembali ke keuangan</Link>
          </Button>
          <Card className="border-border">
            <CardContent className="p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-48" />
                </div>
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
              <Skeleton className="h-20 rounded-xl" />
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  if (error || !transaction) {
    return (
      <>
        <AppHeader title="Detail Transaksi" subtitle="Transaksi tidak ditemukan" />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link to="/keuangan" className="hover:text-field">Keuangan</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{params.id}</span>
          </nav>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/keuangan"><ArrowLeft className="h-4 w-4" /> Kembali ke keuangan</Link>
          </Button>
          <ErrorBanner
            title="Transaksi tidak ditemukan"
            description={error ? (error as Error)?.message : "ID transaksi tidak valid atau sudah dihapus."}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Detail Transaksi" subtitle={transaction.keterangan} />
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/keuangan" className="hover:text-field">Keuangan</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{transaction.id}</span>
        </nav>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link to="/keuangan"><ArrowLeft className="h-4 w-4" /> Kembali ke keuangan</Link>
        </Button>
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Kategori</p>
                <p className="mt-1 font-display text-2xl text-foreground">{transaction.kategori}</p>
              </div>
              <Badge variant="outline" className={transaction.tipe === "masuk" ? "border-win/30 bg-win/10 text-win" : "border-loss/30 bg-loss/10 text-loss"}>
                {transaction.tipe === "masuk" ? <TrendingUp className="mr-1 h-3 w-3" aria-hidden /> : <TrendingDown className="mr-1 h-3 w-3" aria-hidden />}
                {transaction.tipe}
              </Badge>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Jumlah</p>
                <p className="mt-2 font-display text-3xl text-foreground">{formatRupiah(transaction.jumlah)}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tanggal</p>
                <p className="mt-2 font-medium text-foreground">{new Date(transaction.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              {transaction.keterangan}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
