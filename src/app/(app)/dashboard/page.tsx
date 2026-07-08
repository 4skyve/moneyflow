import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries";
import { formatIDR } from "@/lib/utils";
import QuickCapture from "@/components/quick-capture";
import FavoritesStrip from "@/components/favorites-strip";
import AddFavoriteForm from "@/components/add-favorite-form";
import TransactionRow from "@/components/transaction-row";
import Link from "next/link";
import { Bell, Target } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as any).id as string;

  const {
    name,
    wallets: userWallets,
    categories: userCategories,
    saldoBebas,
    totalSavings,
    totalLoan,
    total,
    todayIncome,
    todayExpense,
    recentTransactions,
    activeGoals,
    favorites,
    upcomingRecurring,
  } = await getDashboardData(userId);

  // Jam WIB (UTC+7) untuk sapaan, tidak bergantung timezone server.
  const wibHour = (new Date().getUTCHours() + 7) % 24;
  const greeting = wibHour < 11 ? "Selamat pagi" : wibHour < 15 ? "Selamat siang" : wibHour < 18 ? "Selamat sore" : "Selamat malam";

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
      <div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {greeting},
        </p>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--text)" }}>
          {name || "Kamu"} 👋
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="mf-card p-5 mf-accent-bg" style={{ background: "var(--accent)" }}>
          <p className="text-xs opacity-90">Saldo Total</p>
          <p className="font-display text-xl font-semibold mt-1">{formatIDR(total)}</p>
          <p className="text-[11px] opacity-80 mt-1">
            Saldo bebas + tabungan{totalLoan > 0 ? ` (setelah dikurangi pinjaman ${formatIDR(totalLoan)})` : ""}
          </p>
        </div>
        <div className="mf-card p-5">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Saldo Bebas
          </p>
          <p className="font-display text-xl font-semibold mt-1" style={{ color: "var(--text)" }}>
            {formatIDR(saldoBebas)}
          </p>
          <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
            Uang di luar tabungan, bisa dipakai kapan pun
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="mf-card p-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Pemasukan hari ini
          </p>
          <p className="font-semibold mt-0.5" style={{ color: "var(--income)" }}>
            +{formatIDR(todayIncome)}
          </p>
        </div>
        <div className="mf-card p-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Pengeluaran hari ini
          </p>
          <p className="font-semibold mt-0.5" style={{ color: "var(--expense)" }}>
            -{formatIDR(todayExpense)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <FavoritesStrip favorites={favorites} />
        </div>
        <AddFavoriteForm wallets={userWallets} categories={userCategories} />
      </div>

      <QuickCapture wallets={userWallets} categories={userCategories} />

      {upcomingRecurring.length > 0 && (
        <div className="mf-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={16} className="mf-accent-text" />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Reminder rutin
            </h3>
          </div>
          <div className="space-y-1">
            {upcomingRecurring.map((r) => (
              <div key={r.id} className="flex justify-between text-sm">
                <span style={{ color: "var(--text)" }}>
                  {r.name} — tanggal {r.dayOfMonth}
                </span>
                <span style={{ color: "var(--text-muted)" }}>{formatIDR(r.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeGoals.length > 0 && (
        <div className="mf-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={16} className="mf-accent-text" />
              <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                Target menabung
              </h3>
            </div>
            <Link href="/goals" className="text-xs mf-accent-text font-semibold">
              Lihat semua
            </Link>
          </div>
          <div className="space-y-3">
            {activeGoals.map((g) => {
              const pct = Math.min(100, (parseFloat(g.currentAmount) / parseFloat(g.targetAmount)) * 100);
              return (
                <div key={g.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: "var(--text)" }}>
                      {g.name}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {formatIDR(g.currentAmount)} / {formatIDR(g.targetAmount)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "var(--card-bg-soft)" }}>
                    <div className="h-2 rounded-full mf-accent-bg" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mf-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Transaksi terbaru
          </h3>
          <Link href="/transactions" className="text-xs mf-accent-text font-semibold">
            Lihat semua
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: "var(--text-muted)" }}>
            Belum ada transaksi. Yuk catat yang pertama! ✨
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {recentTransactions.map((t) => (
              <TransactionRow
                key={t.id}
                id={t.id}
                title={t.title}
                amount={t.amount}
                type={t.type as "income" | "expense"}
                categoryName={t.categoryName}
                walletName={t.walletName}
                occurredAt={t.occurredAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
