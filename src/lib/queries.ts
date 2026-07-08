import { db } from "@/db";
import {
  wallets,
  categories,
  transactions,
  savingsGoals,
  recurringExpenses,
  favoriteTransactions,
  dailyNotes,
  wishlistItems,
  users,
} from "@/db/schema";
import { eq, and, like, desc, gte, lte } from "drizzle-orm";
import { getTotalBalance, getWalletBalances, getSavingsSummary } from "@/lib/balance";
import { startOfWIBDay, getWIBParts, wibToUTC } from "@/lib/timezone";

export async function listWallets(userId: string) {
  return getWalletBalances(userId);
}

export async function listCategories(userId: string) {
  return db.select().from(categories).where(eq(categories.userId, userId));
}

export async function listTransactions(
  userId: string,
  filters: { q?: string; wallet?: string; category?: string; type?: string; limit?: number }
) {
  const conditions = [eq(transactions.userId, userId), eq(transactions.isDraft, false)];
  if (filters.q) conditions.push(like(transactions.title, `%${filters.q}%`));
  if (filters.wallet) conditions.push(eq(transactions.walletId, filters.wallet));
  if (filters.category) conditions.push(eq(transactions.categoryId, filters.category));
  if (filters.type) conditions.push(eq(transactions.type, filters.type as "income" | "expense"));

  return db
    .select({
      id: transactions.id,
      title: transactions.title,
      amount: transactions.amount,
      type: transactions.type,
      occurredAt: transactions.occurredAt,
      note: transactions.note,
      tagsCsv: transactions.tagsCsv,
      walletId: transactions.walletId,
      walletName: wallets.name,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(wallets, eq(transactions.walletId, wallets.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.occurredAt))
    .limit(filters.limit ?? 100);
}

export async function listGoals(userId: string) {
  return db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId)).orderBy(desc(savingsGoals.createdAt));
}

export async function listRecurring(userId: string) {
  return db.select().from(recurringExpenses).where(eq(recurringExpenses.userId, userId));
}

export async function listWishlist(userId: string) {
  return db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId)).orderBy(desc(wishlistItems.createdAt));
}

export async function listFavorites(userId: string) {
  return db.select().from(favoriteTransactions).where(eq(favoriteTransactions.userId, userId));
}

export async function listNotes(userId: string) {
  return db.select().from(dailyNotes).where(eq(dailyNotes.userId, userId)).orderBy(desc(dailyNotes.occurredAt)).limit(50);
}

/** Mirrors what the web Dashboard page shows, as a single aggregate payload for mobile. */
export async function getDashboardData(userId: string) {
  const startOfToday = startOfWIBDay(0);

  const [me, userWallets, userCategories, totals, todayTx, recentTx, activeGoals, favorites, upcomingRecurring] =
    await Promise.all([
      db.select({ name: users.name }).from(users).where(eq(users.id, userId)).then((r) => r[0]),
      listWallets(userId),
      listCategories(userId),
      getTotalBalance(userId),
      db
        .select()
        .from(transactions)
        .where(and(eq(transactions.userId, userId), eq(transactions.isDraft, false), gte(transactions.occurredAt, startOfToday))),
      listTransactions(userId, { limit: 6 }),
      db.select().from(savingsGoals).where(and(eq(savingsGoals.userId, userId), eq(savingsGoals.achieved, false))).limit(3),
      db.select().from(favoriteTransactions).where(eq(favoriteTransactions.userId, userId)).limit(8),
      db.select().from(recurringExpenses).where(and(eq(recurringExpenses.userId, userId), eq(recurringExpenses.active, true))),
    ]);

  const todayIncome = todayTx.filter((t) => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
  const todayExpense = todayTx.filter((t) => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);

  return {
    name: me?.name ?? "",
    wallets: userWallets,
    categories: userCategories,
    ...totals,
    todayIncome,
    todayExpense,
    recentTransactions: recentTx,
    activeGoals,
    favorites,
    upcomingRecurring,
  };
}

type Period = "daily" | "weekly" | "monthly" | "yearly";

function getRange(period: Period, offset: number) {
  const { year, month, day, weekday } = getWIBParts(new Date());

  let start: Date, end: Date, prevStart: Date, prevEnd: Date;

  if (period === "daily") {
    start = wibToUTC(year, month, day + offset, 0, 0, 0, 0);
    end = wibToUTC(year, month, day + offset, 23, 59, 59, 999);
    prevStart = wibToUTC(year, month, day + offset - 1, 0, 0, 0, 0);
    prevEnd = wibToUTC(year, month, day + offset - 1, 23, 59, 59, 999);
  } else if (period === "weekly") {
    start = wibToUTC(year, month, day - weekday + offset * 7, 0, 0, 0, 0);
    end = wibToUTC(year, month, day - weekday + offset * 7 + 6, 23, 59, 59, 999);
    prevStart = wibToUTC(year, month, day - weekday + (offset - 1) * 7, 0, 0, 0, 0);
    prevEnd = wibToUTC(year, month, day - weekday + (offset - 1) * 7 + 6, 23, 59, 59, 999);
  } else if (period === "yearly") {
    start = wibToUTC(year + offset, 0, 1, 0, 0, 0, 0);
    end = wibToUTC(year + offset, 11, 31, 23, 59, 59, 999);
    prevStart = wibToUTC(year + offset - 1, 0, 1, 0, 0, 0, 0);
    prevEnd = wibToUTC(year + offset - 1, 11, 31, 23, 59, 59, 999);
  } else {
    start = wibToUTC(year, month + offset, 1, 0, 0, 0, 0);
    end = wibToUTC(year, month + offset + 1, 0, 23, 59, 59, 999);
    prevStart = wibToUTC(year, month + offset - 1, 1, 0, 0, 0, 0);
    prevEnd = wibToUTC(year, month + offset, 0, 23, 59, 59, 999);
  }
  return { start, end, prevStart, prevEnd };
}

/** Mirrors the web Stats page calculations, shared so both surfaces agree on the numbers. */
export async function getStatsData(userId: string, period: Period) {
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
  const topCategory = topCategoryEntry ? cats.find((c) => c.id === topCategoryEntry[0])?.name ?? "Tanpa kategori" : null;

  const biggestTx = txs.filter((t) => t.type === "expense").sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))[0] ?? null;
  const expenseCount = txs.filter((t) => t.type === "expense").length;
  const avgExpense = expenseCount ? expense / expenseCount : 0;

  const trend = [];
  for (let i = -5; i <= 0; i++) {
    const { start: s, end: e } = getRange(period, i);
    const bucketTx = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.isDraft, false), gte(transactions.occurredAt, s), lte(transactions.occurredAt, e)));
    trend.push({
      label: period === "yearly" ? s.toLocaleDateString("id-ID", { year: "numeric", timeZone: "Asia/Jakarta" }) : period === "monthly" ? s.toLocaleDateString("id-ID", { month: "short", timeZone: "Asia/Jakarta" }) : s.toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }),
      pemasukan: bucketTx.filter((t) => t.type === "income").reduce((sum, t) => sum + parseFloat(t.amount), 0),
      pengeluaran: bucketTx.filter((t) => t.type === "expense").reduce((sum, t) => sum + parseFloat(t.amount), 0),
    });
  }

  return {
    period,
    income,
    expense,
    selisih: income - expense,
    avgExpense,
    topCategory,
    biggestTransaction: biggestTx,
    expenseChangePct,
    trend,
  };
}
