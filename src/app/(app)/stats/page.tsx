import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transactions, categories } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import PageHeader from "@/components/page-header";
import { formatIDR } from "@/lib/utils";
import TrendChart from "./trend-chart";
import Link from "next/link";

type Period = "daily" | "weekly" | "monthly" | "yearly";

function getRange(period: Period, offset: number) {
  const now = new Date();
  let start: Date, end: Date, prevStart: Date, prevEnd: Date;

  if (period === "daily") {
    start = new Date(now); start.setDate(start.getDate() + offset); start.setHours(0, 0, 0, 0);
    end = new Date(start); end.setHours(23, 59, 59, 999);
    prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 1);
    prevEnd = new Date(end); prevEnd.setDate(prevEnd.getDate() - 1);
  } else if (period === "weekly") {
    const day = now.getDay();
    start = new Date(now); start.setDate(start.getDate() - day + offset * 7); start.setHours(0, 0, 0, 0);
    end = new Date(start); end.setDate(end.getDate() + 6); end.setHours(23, 59, 59, 999);
    prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 7);
    prevEnd = new Date(end); prevEnd.setDate(prevEnd.getDate() - 7);
  } else if (period === "yearly") {
    start = new Date(now.getFullYear() + offset, 0, 1);
    end = new Date(now.getFullYear() + offset, 11, 31, 23, 59, 59);
    prevStart = new Date(now.getFullYear() + offset - 1, 0, 1);
    prevEnd = new Date(now.getFullYear() + offset - 1, 11, 31, 23, 59, 59);
  } else {
    start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59);
    prevStart = new Date(now.getFullYear(), now.getMonth() + offset - 1, 1);
    prevEnd = new Date(now.getFullYear(), now.getMonth() + offset, 0, 23, 59, 59);
  }
  return { start, end, prevStart, prevEnd };
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ period?: Period }> }) {
  const session = await auth();
  const userId = (session?.user as any).id as string;
  const sp = await searchParams;
  const period = sp.period ?? "monthly";
  const { start, end, prevStart, prevEnd } = getRange(period, 0);

  const [txs, prevTxs, cats] = await Promise.all([
    db.select().from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.isDraft, false), gte(transactions.occurredAt, start), lte(transactions.occurredAt, end))),
    db.select().from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.isDraft, false), gte(transactions.occurredAt, prevStart), lte(transactions.occurredAt, prevEnd))),
    db.select().from(categories).where(eq(categories.userId, userId)),
  ]);

  const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
  const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
  const prevExpense = prevTxs.filter((t) => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
  const expenseChangePct = prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : null;

  const catMap = new Map<string, number>();
  for (const t of txs.filter((t) => t.type === "expense")) {
    const key = t.categoryId ?? "none";
    catMap.set(key, (catMap.get(key) ?? 0) + parseFloat(t.amount));
  }
  const topCategoryEntry = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryEntry ? cats.find((c) => c.id === topCategoryEntry[0])?.name ?? "Tanpa kategori" : "-";

  const biggestTx = txs.filter((t) => t.type === "expense").sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))[0];

  const expenseCount = txs.filter((t) => t.type === "expense").length;
  const avgExpense = expenseCount ? expense / expenseCount : 0;

  // simple trend: last 6 buckets of chosen period
  const trendData = [];
  for (let i = -5; i <= 0; i++) {
    const { start: s, end: e } = getRange(period, i);
    const bucketTx = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.isDraft, false), gte(transactions.occurredAt, s), lte(transactions.occurredAt, e)));
    trendData.push({
      label: period === "yearly" ? s.getFullYear().toString() : period === "monthly" ? s.toLocaleDateString("id-ID", { month: "short" }) : s.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      pemasukan: bucketTx.filter((t) => t.type === "income").reduce((sum, t) => sum + parseFloat(t.amount), 0),
      pengeluaran: bucketTx.filter((t) => t.type === "expense").reduce((sum, t) => sum + parseFloat(t.amount), 0),
    });
  }

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
        <StatBox label="Selisih" value={formatIDR(income - expense)} color={income - expense >= 0 ? "var(--income)" : "var(--expense)"} />
        <StatBox label="Rata-rata Pengeluaran" value={formatIDR(avgExpense)} color="var(--text)" />
      </div>

      <div className="mf-card p-4">
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Kategori terbesar</p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{topCategory}</p>
      </div>

      {biggestTx && (
        <div className="mf-card p-4">
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Transaksi terbesar</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{biggestTx.title} — {formatIDR(biggestTx.amount)}</p>
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
        <TrendChart data={trendData} />
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
