import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah, transactionById } from "@/lib/demo-data";

export const Route = createFileRoute("/keuangan/$id")({
  loader: ({ params }) => {
    const transaction = transactionById(params.id);
    if (!transaction) throw notFound();
    return { transaction };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Transaksi ${loaderData?.transaction.id} — bolaID Football OS` },
      { name: "description", content: `Detail transaksi ${loaderData?.transaction.keterangan}.` },
      { property: "og:title", content: `Transaksi ${loaderData?.transaction.id} — bolaID Football OS` },
    ],
  }),
  component: FinanceDetailPage,
});

function FinanceDetailPage() {
  const { transaction } = Route.useLoaderData();
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
