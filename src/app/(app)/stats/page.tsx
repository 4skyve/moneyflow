import { auth } from "@/lib/auth";
import { getStatsData } from "@/lib/queries";
import PageHeader from "@/components/page-header";
import { formatIDR } from "@/lib/utils";
import TrendChart from "./trend-chart";
import Link from "next/link";

type Period = "daily" | "weekly" | "monthly" | "yearly";

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ period?: Period }> }) {
  const session = await auth();
  const userId = (session?.user as any).id as string;
  const sp = await searchParams;
  const period = sp.period ?? "monthly";

  const {
    income,
    expense,
    selisih,
    avgExpense,
    topCategory,
    biggestTransaction,
    expenseChangePct,
    trend,
  } = await getStatsData(userId, period);

  const periods: { key: Period; label: string }[] = [
    { key: "daily", label: "Harian" },
    { key: "weekly", label: "Mingguan" },
    { key: "monthly", label: "Bulanan" },
    { key: "yearly", label: "Tahunan" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-5">
      <PageHeader title="Statistik" subtitle="Informatif, bukan menghakimi ✨" />

      <div className="flex gap-2 text-xs">
        {periods.map((p) => (
          <Link
            key={p.key}
            href={`/stats?period=${p.key}`}
            className="px-3 py-1.5 rounded-full border font-semibold"
            style={{
              background: period === p.key ? "var(--accent)" : "var(--card-bg)",
              color: period === p.key ? "#fff" : "var(--text-muted)",
              borderColor: "var(--border)",
            }}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Total Pemasukan" value={formatIDR(income)} color="var(--income)" />
        <StatBox label="Total Pengeluaran" value={formatIDR(expense)} color="var(--expense)" />
        <StatBox label="Selisih" value={formatIDR(selisih)} color={selisih >= 0 ? "var(--income)" : "var(--expense)"} />
        <StatBox label="Rata-rata Pengeluaran" value={formatIDR(avgExpense)} color="var(--text)" />
      </div>

      <div className="mf-card p-4">
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Kategori terbesar</p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{topCategory ?? "-"}</p>
      </div>

      {biggestTransaction && (
        <div className="mf-card p-4">
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Transaksi terbesar</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{biggestTransaction.title} — {formatIDR(biggestTransaction.amount)}</p>
        </div>
      )}

      {expenseChangePct !== null && (
        <div className="mf-card p-4">
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Dibanding periode sebelumnya</p>
          <p className="text-sm" style={{ color: expenseChangePct > 0 ? "var(--expense)" : "var(--income)" }}>
            Pengeluaran {expenseChangePct > 0 ? "naik" : "turun"} {Math.abs(expenseChangePct).toFixed(0)}%
          </p>
        </div>
      )}

      <div className="mf-card p-4">
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>Grafik tren</p>
        <TrendChart data={trend} />
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="mf-card p-4">
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="font-semibold mt-1" style={{ color }}>{value}</p>
    </div>
  );
}
