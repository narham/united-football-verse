import { createFileRoute } from "@tanstack/react-router";

import { AppHeader } from "@/components/app-header";
import { FinanceSummary } from "@/components/finance-summary";

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
        <FinanceSummary />
      </main>
    </>
  );
}
