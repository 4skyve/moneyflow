"use server";

import { db } from "@/db";
import {
  wallets,
  categories,
  transactions,
  transfers,
  savingsAccounts,
  savingsDeposits,
  savingsDetails,
  savingsLoans,
  savingsLoanReturns,
  savingsGoals,
  savingsGoalContributions,
  recurringExpenses,
  wishlistItems,
  favoriteTransactions,
  dailyNotes,
  balanceAdjustments,
  users,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getCurrentUserId } from "@/lib/auth-context";

async function requireUserId() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

function num(fd: FormData, key: string) {
  const v = fd.get(key);
  return v ? parseFloat(v.toString().replace(/[^0-9.-]/g, "")) : 0;
}
function str(fd: FormData, key: string) {
  return (fd.get(key)?.toString() ?? "").trim();
}

// ---------- TRANSACTIONS (Quick Capture) ----------
export async function createTransaction(fd: FormData) {
  const userId = await requireUserId();
  const occurredAtRaw = str(fd, "occurredAt");
  await db.insert(transactions).values({
    userId,
    walletId: str(fd, "walletId"),
    categoryId: str(fd, "categoryId") || null,
    title: str(fd, "title"),
    amount: num(fd, "amount").toString(),
    type: (str(fd, "type") as "income" | "expense") || "expense",
    occurredAt: occurredAtRaw ? new Date(occurredAtRaw) : new Date(),
    note: str(fd, "note") || null,
    tagsCsv: str(fd, "tags"),
    isDraft: str(fd, "isDraft") === "true",
    isFavorite: false,
  });
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function deleteTransaction(id: string) {
  const userId = await requireUserId();
  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function useFavoriteAsTransaction(favId: string) {
  const userId = await requireUserId();
  const [fav] = await db
    .select()
    .from(favoriteTransactions)
    .where(and(eq(favoriteTransactions.id, favId), eq(favoriteTransactions.userId, userId)));
  if (!fav) throw new Error("Favorite not found");
  await db.insert(transactions).values({
    userId,
    walletId: fav.walletId!,
    categoryId: fav.categoryId,
    title: fav.title,
    amount: fav.amount,
    type: "expense",
    occurredAt: new Date(),
    tagsCsv: "",
  });
  revalidatePath("/dashboard");
}

export async function saveFavorite(fd: FormData) {
  const userId = await requireUserId();
  await db.insert(favoriteTransactions).values({
    userId,
    emoji: str(fd, "emoji") || "⭐",
    title: str(fd, "title"),
    amount: num(fd, "amount").toString(),
    categoryId: str(fd, "categoryId") || null,
    walletId: str(fd, "walletId") || null,
  });
  revalidatePath("/dashboard");
}

// ---------- WALLETS ----------
export async function createWallet(fd: FormData) {
  const userId = await requireUserId();
  await db.insert(wallets).values({
    userId,
    name: str(fd, "name"),
    icon: str(fd, "icon") || "wallet",
    color: str(fd, "color") || "#F2879E",
    startingBalance: num(fd, "startingBalance").toString(),
  });
  revalidatePath("/wallets");
  revalidatePath("/dashboard");
}

export async function archiveWallet(id: string) {
  const userId = await requireUserId();
  await db.update(wallets).set({ archived: true }).where(and(eq(wallets.id, id), eq(wallets.userId, userId)));
  revalidatePath("/wallets");
}

// ---------- CATEGORIES ----------
export async function createCategory(fd: FormData) {
  const userId = await requireUserId();
  await db.insert(categories).values({
    userId,
    name: str(fd, "name"),
    type: (str(fd, "type") as "income" | "expense") || "expense",
    icon: str(fd, "icon") || "tag",
    color: str(fd, "color") || "#B8E0D2",
  });
  revalidatePath("/categories");
}

export async function deleteCategory(id: string) {
  const userId = await requireUserId();
  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
  revalidatePath("/categories");
}

// ---------- TRANSFER ----------
export async function createTransfer(fd: FormData) {
  const userId = await requireUserId();
  await db.insert(transfers).values({
    userId,
    fromWalletId: str(fd, "fromWalletId"),
    toWalletId: str(fd, "toWalletId"),
    amount: num(fd, "amount").toString(),
    note: str(fd, "note") || null,
    occurredAt: new Date(),
  });
  revalidatePath("/wallets");
  revalidatePath("/dashboard");
}

// ---------- SAVINGS ----------
export async function createSavingsAccount(fd: FormData) {
  const userId = await requireUserId();
  await db.insert(savingsAccounts).values({
    userId,
    name: str(fd, "name"),
    icon: str(fd, "icon") || "piggy-bank",
    startingBalance: num(fd, "startingBalance").toString(),
  });
  revalidatePath("/savings");
  revalidatePath("/dashboard");
}

export async function deleteSavingsAccount(id: string) {
  const userId = await requireUserId();

  const loans = await db
    .select()
    .from(savingsLoans)
    .where(and(eq(savingsLoans.savingsAccountId, id), eq(savingsLoans.userId, userId)));
  const hasOutstandingLoan = loans.some(
    (l) => parseFloat(l.amount) - parseFloat(l.amountReturned) > 0
  );
  if (hasOutstandingLoan) {
    throw new Error("Tidak bisa dihapus: masih ada pinjaman yang belum dikembalikan.");
  }

  await db.delete(savingsDetails).where(eq(savingsDetails.savingsAccountId, id));
  await db.delete(savingsDeposits).where(and(eq(savingsDeposits.savingsAccountId, id), eq(savingsDeposits.userId, userId)));
  const loanIds = loans.map((l) => l.id);
  if (loanIds.length > 0) {
    await db.delete(savingsLoanReturns).where(inArray(savingsLoanReturns.loanId, loanIds));
  }
  await db.delete(savingsLoans).where(and(eq(savingsLoans.savingsAccountId, id), eq(savingsLoans.userId, userId)));
  await db.delete(savingsAccounts).where(and(eq(savingsAccounts.id, id), eq(savingsAccounts.userId, userId)));

  revalidatePath("/savings");
  revalidatePath("/dashboard");
}

export async function depositToSavings(fd: FormData) {
  const userId = await requireUserId();
  await db.insert(savingsDeposits).values({
    userId,
    savingsAccountId: str(fd, "savingsAccountId"),
    walletId: str(fd, "walletId"),
    amount: num(fd, "amount").toString(),
    direction: "in",
    note: str(fd, "note") || null,
    occurredAt: new Date(),
  });
  revalidatePath("/savings");
  revalidatePath("/dashboard");
}

export async function addSavingsDetail(fd: FormData) {
  await requireUserId();
  await db.insert(savingsDetails).values({
    savingsAccountId: str(fd, "savingsAccountId"),
    label: str(fd, "label"),
    amount: num(fd, "amount").toString(),
  });
  revalidatePath("/savings");
}

export async function deleteSavingsDetail(id: string) {
  await requireUserId();
  await db.delete(savingsDetails).where(eq(savingsDetails.id, id));
  revalidatePath("/savings");
}

export async function borrowFromSavings(fd: FormData) {
  const userId = await requireUserId();
  await db.insert(savingsLoans).values({
    userId,
    savingsAccountId: str(fd, "savingsAccountId"),
    walletId: str(fd, "walletId"),
    amount: num(fd, "amount").toString(),
    note: str(fd, "note") || null,
    occurredAt: new Date(),
  });
  revalidatePath("/savings");
  revalidatePath("/dashboard");
}

export async function returnLoan(fd: FormData) {
  const userId = await requireUserId();
  const loanId = str(fd, "loanId");
  const amount = num(fd, "amount");
  const walletId = str(fd, "walletId");

  const [loan] = await db.select().from(savingsLoans).where(eq(savingsLoans.id, loanId));
  if (!loan) throw new Error("Loan not found");

  await db.insert(savingsLoanReturns).values({
    loanId,
    walletId,
    amount: amount.toString(),
    occurredAt: new Date(),
  });
  await db
    .update(savingsLoans)
    .set({ amountReturned: (parseFloat(loan.amountReturned) + amount).toString() })
    .where(eq(savingsLoans.id, loanId));

  revalidatePath("/savings");
  revalidatePath("/dashboard");
}

// ---------- SAVINGS GOALS ----------
export async function createGoal(fd: FormData) {
  const userId = await requireUserId();
  const deadline = str(fd, "deadline");
  await db.insert(savingsGoals).values({
    userId,
    name: str(fd, "name"),
    targetAmount: num(fd, "targetAmount").toString(),
    frequency: (str(fd, "frequency") as any) || "monthly",
    deadline: deadline ? new Date(deadline) : null,
    icon: str(fd, "icon") || "target",
  });
  revalidatePath("/goals");
}

export async function contributeToGoal(fd: FormData) {
  const userId = await requireUserId();
  const goalId = str(fd, "goalId");
  const amount = num(fd, "amount");
  const walletId = str(fd, "walletId");

  const [goal] = await db.select().from(savingsGoals).where(eq(savingsGoals.id, goalId));
  if (!goal) throw new Error("Goal not found");

  await db.insert(savingsGoalContributions).values({
    goalId,
    walletId,
    amount: amount.toString(),
    occurredAt: new Date(),
  });
  const newAmount = parseFloat(goal.currentAmount) + amount;
  await db
    .update(savingsGoals)
    .set({
      currentAmount: newAmount.toString(),
      achieved: newAmount >= parseFloat(goal.targetAmount),
    })
    .where(eq(savingsGoals.id, goalId));

  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

// ---------- RECURRING ----------
export async function createRecurring(fd: FormData) {
  const userId = await requireUserId();
  await db.insert(recurringExpenses).values({
    userId,
    name: str(fd, "name"),
    amount: num(fd, "amount").toString(),
    dayOfMonth: Math.min(28, Math.max(1, num(fd, "dayOfMonth") || 1)),
    categoryId: str(fd, "categoryId") || null,
    icon: str(fd, "icon") || "repeat",
  });
  revalidatePath("/recurring");
  revalidatePath("/dashboard");
}

export async function toggleRecurring(id: string, active: boolean) {
  const userId = await requireUserId();
  await db
    .update(recurringExpenses)
    .set({ active })
    .where(and(eq(recurringExpenses.id, id), eq(recurringExpenses.userId, userId)));
  revalidatePath("/recurring");
}

// ---------- WISHLIST ----------
export async function createWishlistItem(fd: FormData) {
  const userId = await requireUserId();
  await db.insert(wishlistItems).values({
    userId,
    name: str(fd, "name"),
    targetPrice: num(fd, "targetPrice").toString(),
  });
  revalidatePath("/wishlist");
}

export async function updateWishlistProgress(id: string, amount: number) {
  const userId = await requireUserId();
  const [item] = await db.select().from(wishlistItems).where(eq(wishlistItems.id, id));
  if (!item) return;
  const newAmount = parseFloat(item.currentAmount) + amount;
  await db
    .update(wishlistItems)
    .set({
      currentAmount: newAmount.toString(),
      status: newAmount >= parseFloat(item.targetPrice) ? "saving" : "saving",
    })
    .where(eq(wishlistItems.id, id));
  revalidatePath("/wishlist");
}

export async function updateWishlistStatus(id: string, status: string) {
  await requireUserId();
  await db
    .update(wishlistItems)
    .set({ status: status as any })
    .where(eq(wishlistItems.id, id));
  revalidatePath("/wishlist");
}

// ---------- NOTES ----------
export async function createNote(fd: FormData) {
  const userId = await requireUserId();
  await db.insert(dailyNotes).values({
    userId,
    content: str(fd, "content"),
    occurredAt: new Date(),
  });
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

// ---------- BALANCE ADJUSTMENT ----------
export async function createAdjustment(fd: FormData) {
  const userId = await requireUserId();
  await db.insert(balanceAdjustments).values({
    userId,
    walletId: str(fd, "walletId"),
    amount: num(fd, "amount").toString(),
    reason: str(fd, "reason") || null,
    occurredAt: new Date(),
  });
  revalidatePath("/wallets");
  revalidatePath("/dashboard");
}

// ---------- SETTINGS ----------
export async function updateThemeSettings(theme: string, mode: string) {
  const userId = await requireUserId();
  await db.update(users).set({ theme, mode: mode as any }).where(eq(users.id, userId));
  revalidatePath("/", "layout");
}

// ---------- DELETE: WISHLIST ----------
export async function deleteWishlistItem(id: string) {
  const userId = await requireUserId();
  await db.delete(wishlistItems).where(and(eq(wishlistItems.id, id), eq(wishlistItems.userId, userId)));
  revalidatePath("/wishlist");
}

// ---------- DELETE: SAVINGS GOAL (Target Menabung) ----------
export async function deleteGoal(id: string) {
  const userId = await requireUserId();
  await db.delete(savingsGoalContributions).where(eq(savingsGoalContributions.goalId, id));
  await db.delete(savingsGoals).where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId)));
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

// ---------- DELETE: RECURRING (Pengeluaran Rutin) ----------
export async function deleteRecurring(id: string) {
  const userId = await requireUserId();
  await db.delete(recurringExpenses).where(and(eq(recurringExpenses.id, id), eq(recurringExpenses.userId, userId)));
  revalidatePath("/recurring");
  revalidatePath("/dashboard");
}

// ---------- DELETE: DAILY NOTE ----------
export async function deleteNote(id: string) {
  const userId = await requireUserId();
  await db.delete(dailyNotes).where(and(eq(dailyNotes.id, id), eq(dailyNotes.userId, userId)));
  revalidatePath("/transactions");
}

// ---------- DELETE: FAVORITE TRANSACTION ----------
export async function deleteFavorite(id: string) {
  const userId = await requireUserId();
  await db.delete(favoriteTransactions).where(and(eq(favoriteTransactions.id, id), eq(favoriteTransactions.userId, userId)));
  revalidatePath("/dashboard");
}

// ---------- MOVE SALDO BEBAS -> TABUNGAN ----------
/**
 * Satu form untuk memindahkan uang dari dompet ke tabungan, dengan dua tujuan:
 * - "deposit": nambah saldo tabungan biasa (sama seperti depositToSavings)
 * - "repay_loan": uangnya dipakai membayar pinjaman tabungan yang masih berjalan
 *   di akun tabungan itu (FIFO: pinjaman yang paling lama diambil dilunasi duluan)
 * Pengguna cukup pilih tabungan mana & tujuannya; sisanya dihitung otomatis.
 */
export async function moveBalanceToSavings(fd: FormData) {
  const userId = await requireUserId();
  const savingsAccountId = str(fd, "savingsAccountId");
  const walletId = str(fd, "walletId");
  const amount = num(fd, "amount");
  const purpose = str(fd, "purpose") || "deposit"; // "deposit" | "repay_loan"
  const note = str(fd, "note") || null;

  if (amount <= 0) throw new Error("Nominal harus lebih dari 0");

  if (purpose === "repay_loan") {
    const openLoans = await db
      .select()
      .from(savingsLoans)
      .where(and(eq(savingsLoans.savingsAccountId, savingsAccountId), eq(savingsLoans.userId, userId)));

    const outstanding = openLoans
      .filter((l) => parseFloat(l.amountReturned) < parseFloat(l.amount))
      .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());

    if (outstanding.length === 0) {
      throw new Error("Tidak ada pinjaman yang perlu dibayar di tabungan ini");
    }

    let remaining = amount;
    for (const loan of outstanding) {
      if (remaining <= 0) break;
      const loanRemaining = parseFloat(loan.amount) - parseFloat(loan.amountReturned);
      const pay = Math.min(remaining, loanRemaining);

      await db.insert(savingsLoanReturns).values({
        loanId: loan.id,
        walletId,
        amount: pay.toString(),
        occurredAt: new Date(),
      });
      await db
        .update(savingsLoans)
        .set({ amountReturned: (parseFloat(loan.amountReturned) + pay).toString() })
        .where(eq(savingsLoans.id, loan.id));

      remaining -= pay;
    }
    // Kalau ada sisa uang setelah semua pinjaman lunas, masukkan sebagai setoran biasa.
    if (remaining > 0) {
      await db.insert(savingsDeposits).values({
        userId,
        savingsAccountId,
        walletId,
        amount: remaining.toString(),
        direction: "in",
        note: note ? `${note} (sisa setelah lunasi pinjaman)` : "Sisa setelah lunasi pinjaman",
        occurredAt: new Date(),
      });
    }
  } else {
    await db.insert(savingsDeposits).values({
      userId,
      savingsAccountId,
      walletId,
      amount: amount.toString(),
      direction: "in",
      note,
      occurredAt: new Date(),
    });
  }

  revalidatePath("/savings");
  revalidatePath("/dashboard");
}
