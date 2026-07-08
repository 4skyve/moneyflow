import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transactions, wallets, categories, dailyNotes } from "@/db/schema";
import { eq, and, like, desc } from "drizzle-orm";
import PageHeader from "@/components/page-header";
import TransactionRow from "@/components/transaction-row";
import { formatDateFull } from "@/lib/utils";
import NoteForm from "./note-form";
import DeleteNoteButton from "./delete-note-button";
import FilterSelect from "./filter-select";
import { Search } from "lucide-react";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; wallet?: string; category?: string; type?: string }>;
}) {
  const session = await auth();
  const userId = (session?.user as any).id as string;
  const sp = await searchParams;

  const [userWallets, userCategories] = await Promise.all([
    db.select().from(wallets).where(eq(wallets.userId, userId)),
    db.select().from(categories).where(eq(categories.userId, userId)),
  ]);

  const conditions = [eq(transactions.userId, userId), eq(transactions.isDraft, false)];
  if (sp.q) conditions.push(like(transactions.title, `%${sp.q}%`));
  if (sp.wallet) conditions.push(eq(transactions.walletId, sp.wallet));
  if (sp.category) conditions.push(eq(transactions.categoryId, sp.category));
  if (sp.type) conditions.push(eq(transactions.type, sp.type as "income" | "expense"));

  const txList = await db
    .select({
      id: transactions.id,
      title: transactions.title,
      amount: transactions.amount,
      type: transactions.type,
      occurredAt: transactions.occurredAt,
      note: transactions.note,
      walletName: wallets.name,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(wallets, eq(transactions.walletId, wallets.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.occurredAt))
    .limit(100);

  const notes = await db
    .select()
    .from(dailyNotes)
    .where(eq(dailyNotes.userId, userId))
    .orderBy(desc(dailyNotes.occurredAt))
    .limit(20);

  // Group by date
  const groups = new Map<string, typeof txList>();
  for (const t of txList) {
    const key = formatDateFull(t.occurredAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8">
      <PageHeader title="Riwayat Transaksi" subtitle="Cari, filter, dan lihat semua catatanmu." />

      <form className="mf-card p-3 flex items-center gap-2 mb-4" method="get">
        <Search size={16} style={{ color: "var(--text-muted)" }} />
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Cari judul transaksi..."
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "var(--text)" }}
        />
      </form>

      <div className="flex flex-wrap gap-2 mb-5 text-xs">
        <FilterSelect name="wallet" label="Semua dompet" options={userWallets.map((w) => ({ value: w.id, label: w.name }))} current={sp.wallet} query={sp} />
        <FilterSelect name="category" label="Semua kategori" options={userCategories.map((c) => ({ value: c.id, label: c.name }))} current={sp.category} query={sp} />
        <FilterSelect name="type" label="Semua jenis" options={[{ value: "income", label: "Pemasukan" }, { value: "expense", label: "Pengeluaran" }]} current={sp.type} query={sp} />
      </div>

      <NoteForm />

      {txList.length === 0 ? (
        <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>
          Tidak ada transaksi ditemukan.
        </p>
      ) : (
        <div className="space-y-6 mt-6">
          {Array.from(groups.entries()).map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                {date}
              </p>
              <div className="mf-card divide-y px-4" style={{ borderColor: "var(--border)" }}>
                {txs.map((t) => (
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
            </div>
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
            Catatan Harian
          </p>
          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="mf-card p-3 text-sm flex items-start justify-between gap-2" style={{ color: "var(--text)" }}>
                <div>
                  <p>{n.content}</p>
                  <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                    {formatDateFull(n.occurredAt)}
                  </p>
                </div>
                <DeleteNoteButton id={n.id} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

