import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { financeTotals, formatRupiah, transactions } from "@/lib/demo-data";

export function FinanceSummary() {
  const { masuk, keluar, saldo } = financeTotals();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-win/30 bg-win/5 p-4">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-win">
            <TrendingUp className="h-4 w-4" /> Pemasukan
          </p>
          <p className="mt-2 font-display text-2xl text-foreground">{formatRupiah(masuk)}</p>
        </div>
        <div className="rounded-xl border border-loss/30 bg-loss/5 p-4">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-loss">
            <TrendingDown className="h-4 w-4" /> Pengeluaran
          </p>
          <p className="mt-2 font-display text-2xl text-foreground">{formatRupiah(keluar)}</p>
        </div>
        <div className="rounded-xl border border-field/30 bg-field/5 p-4">
          <p className="text-xs uppercase tracking-wide text-field">Saldo</p>
          <p className={cn("mt-2 font-display text-2xl", saldo >= 0 ? "text-foreground" : "text-loss")}>
            {formatRupiah(saldo)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-display text-xl text-foreground">Transaksi Terbaru</h3>
        </div>
        <ul className="divide-y divide-border">
          {transactions.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  t.tipe === "masuk" ? "bg-win/10 text-win" : "bg-loss/10 text-loss",
                )}
              >
                {t.tipe === "masuk" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{t.kategori}</p>
                <p className="truncate text-sm text-muted-foreground">{t.keterangan}</p>
              </div>
              <div className="text-right">
                <p className={cn("font-semibold", t.tipe === "masuk" ? "text-win" : "text-loss")}>
                  {t.tipe === "masuk" ? "+" : "−"} {formatRupiah(t.jumlah)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(t.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
