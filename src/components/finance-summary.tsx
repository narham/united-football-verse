import { Link } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  financeTotals,
  formatRupiah,
  transactions as defaultTransactions,
  type Transaction,
  type TxCat,
} from "@/lib/demo-data";
import { DataState, DefaultEmptyState } from "@/components/data-state";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const KATEGORI_BADGE: Partial<Record<TxCat | string, string>> = {
  SPP: "bg-field/10 text-field ring-field/20",
  Registration: "bg-energetic/20 text-energetic-foreground ring-energetic/30",
  Tournament: "bg-win/10 text-win ring-win/20",
  Equipment: "bg-draw/10 text-draw ring-draw/20",
  Operational: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20",
  Other: "bg-muted text-muted-foreground ring-border",
};

function catBadgeClass(cat: TxCat | string): string {
  return (
    KATEGORI_BADGE[cat] ??
    "bg-muted text-muted-foreground ring-border"
  );
}

export function FinanceSummary({
  transactions = defaultTransactions,
}: {
  transactions?: Transaction[];
}) {
  const totals = financeTotals();

  return (
    <DataState
      status={transactions.length === 0 ? "empty" : "success"}
      emptyNode={
        <DefaultEmptyState
          icon={Filter}
          title="Tidak ada transaksi"
          description="Data transaksi belum tersedia untuk periode ini."
        />
      }
    >
      <div className="space-y-4">
        {/* KPI Cards §14: balance, total income, total expense */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="border border-win/30 bg-win/5">
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-win">
                <TrendingUp className="h-4 w-4" aria-hidden /> Pemasukan
              </p>
              <p className="mt-2 font-display text-2xl md:text-3xl text-foreground">
                {formatRupiah(totals.masuk)}
              </p>
              <Badge variant="outline" className="mt-1.5 border-win/20 text-win text-[11px]">
                {transactions.filter((t) => t.tipe === "masuk").length} transaksi
              </Badge>
            </CardContent>
          </Card>

          <Card className="border border-loss/30 bg-loss/5">
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-loss">
                <TrendingDown className="h-4 w-4" aria-hidden /> Pengeluaran
              </p>
              <p className="mt-2 font-display text-2xl md:text-3xl text-foreground">
                {formatRupiah(totals.keluar)}
              </p>
              <Badge variant="outline" className="mt-1.5 border-loss/20 text-loss text-[11px]">
                {transactions.filter((t) => t.tipe === "keluar").length} transaksi
              </Badge>
            </CardContent>
          </Card>

          <Card className="border border-field/30 bg-field/5">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-field">Saldo Klub</p>
              <p
                className={cn(
                  "mt-2 font-display text-2xl md:text-3xl",
                  totals.saldo >= 0 ? "text-foreground" : "text-loss",
                )}
              >
                {formatRupiah(totals.saldo)}
              </p>
              <Badge variant="outline" className="mt-1.5 border-field/20 text-field text-[11px]">
                {totals.saldo >= 0 ? "Sehat" : "Perhatian"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Transaction List per §14 */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-xl text-foreground">
              Transaksi Terbaru
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              {(["Semua", "masuk", "keluar"] as const).map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className={cn(
                    "cursor-default",
                    t === "Semua"
                      ? "bg-field/5 border-field/20 text-field"
                      : t === "masuk"
                      ? "bg-win/5 border-win/20 text-win"
                      : "bg-loss/5 border-loss/20 text-loss",
                  )}
                >
                  {t === "Semua"
                    ? `${transactions.length} total`
                    : t === "masuk"
                    ? `${transactions.filter((x) => x.tipe === "masuk").length} masuk`
                    : `${transactions.filter((x) => x.tipe === "keluar").length} keluar`}
                </Badge>
              ))}
            </div>
          </div>
          <ul className="divide-y divide-border" role="list" aria-label="Daftar transaksi">
            {transactions.map((t) => (
              <li key={t.id} role="listitem">
                <Link
                  to="/keuangan/$id"
                  params={{ id: t.id }}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    t.tipe === "masuk"
                      ? "bg-win/10 text-win"
                      : "bg-loss/10 text-loss",
                  )}
                  aria-hidden
                >
                  {t.tipe === "masuk" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-foreground">
                      {t.kategori}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1",
                        catBadgeClass(t.kategori),
                      )}
                    >
                      {t.kategori}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {t.keterangan}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={cn(
                      "font-semibold whitespace-nowrap",
                      t.tipe === "masuk" ? "text-win" : "text-loss",
                    )}
                  >
                    {t.tipe === "masuk" ? "+" : "−"} {formatRupiah(t.jumlah)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.tanggal).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DataState>
  );
}
