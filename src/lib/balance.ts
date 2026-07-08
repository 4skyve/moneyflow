import { db } from "@/db";
import {
  wallets,
  transactions,
  transfers,
  savingsDeposits,
  savingsLoans,
  savingsLoanReturns,
  balanceAdjustments,
  savingsAccounts,
  savingsDetails,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

/** Saldo per dompet = starting + income - expense + transferIn - transferOut
 *  - savingsDepositOut (uang keluar ke tabungan) + savingsLoanIn (pinjaman cair ke dompet)
 *  - loanReturnOut (mengembalikan pinjaman) + adjustments
 */
export async function getWalletBalances(userId: string) {
  const [userWallets, allTx, allTransfers, deposits, loans, adjustments] = await Promise.all([
    db.select().from(wallets).where(and(eq(wallets.userId, userId), eq(wallets.archived, false))),
    db.select().from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.isDraft, false))),
    db.select().from(transfers).where(eq(transfers.userId, userId)),
    db.select().from(savingsDeposits).where(eq(savingsDeposits.userId, userId)),
    db.select().from(savingsLoans).where(eq(savingsLoans.userId, userId)),
    db.select().from(balanceAdjustments).where(eq(balanceAdjustments.userId, userId)),
  ]);

  const loanIds = loans.map((l) => l.id);
  const loanReturns = loanIds.length ? await db.select().from(savingsLoanReturns) : [];

  const balances = new Map<string, number>();
  for (const w of userWallets) balances.set(w.id, parseFloat(w.startingBalance));

  for (const t of allTx) {
    const cur = balances.get(t.walletId) ?? 0;
    const amt = parseFloat(t.amount);
    balances.set(t.walletId, t.type === "income" ? cur + amt : cur - amt);
  }
  for (const tr of allTransfers) {
    const amt = parseFloat(tr.amount);
    balances.set(tr.fromWalletId, (balances.get(tr.fromWalletId) ?? 0) - amt);
    balances.set(tr.toWalletId, (balances.get(tr.toWalletId) ?? 0) + amt);
  }
  for (const d of deposits) {
    const amt = parseFloat(d.amount);
    // "in" = uang keluar dari wallet menuju savings
    balances.set(d.walletId, (balances.get(d.walletId) ?? 0) + (d.direction === "in" ? -amt : amt));
  }
  for (const l of loans) {
    const amt = parseFloat(l.amount);
    balances.set(l.walletId, (balances.get(l.walletId) ?? 0) + amt); // pinjaman cair -> wallet bertambah
  }
  for (const lr of loanReturns.filter((r) => loanIds.includes(r.loanId))) {
    const amt = parseFloat(lr.amount);
    balances.set(lr.walletId, (balances.get(lr.walletId) ?? 0) - amt); // uang keluar dari wallet utk bayar pinjaman
  }
  for (const a of adjustments) {
    const amt = parseFloat(a.amount);
    balances.set(a.walletId, (balances.get(a.walletId) ?? 0) + amt);
  }

  return userWallets.map((w) => ({ ...w, balance: balances.get(w.id) ?? 0 }));
}

export async function getSaldoBebas(userId: string) {
  const bal = await getWalletBalances(userId);
  return bal.reduce((sum, w) => sum + w.balance, 0);
}

export async function getSavingsSummary(userId: string) {
  const [accounts, deposits, loans, details] = await Promise.all([
    db.select().from(savingsAccounts).where(eq(savingsAccounts.userId, userId)),
    db.select().from(savingsDeposits).where(eq(savingsDeposits.userId, userId)),
    db.select().from(savingsLoans).where(eq(savingsLoans.userId, userId)),
    db.select().from(savingsDetails),
  ]);

  const result = accounts.map((acc) => {
    const accDeposits = deposits.filter((d) => d.savingsAccountId === acc.id);
    const savedAmount = parseFloat(acc.startingBalance) + accDeposits.reduce(
      (sum, d) => sum + (d.direction === "in" ? parseFloat(d.amount) : -parseFloat(d.amount)),
      0
    );
    const accLoans = loans.filter((l) => l.savingsAccountId === acc.id);
    const outstandingLoan = accLoans.reduce(
      (sum, l) => sum + (parseFloat(l.amount) - parseFloat(l.amountReturned)),
      0
    );
    const accDetails = details.filter((d) => d.savingsAccountId === acc.id);
    return {
      ...acc,
      savedAmount,
      outstandingLoan,
      details: accDetails,
    };
  });

  const totalSavings = result.reduce((s, a) => s + a.savedAmount, 0);
  const totalLoan = result.reduce((s, a) => s + a.outstandingLoan, 0);

  return { accounts: result, totalSavings, totalLoan };
}

export async function getTotalBalance(userId: string) {
  const [saldoBebas, { totalSavings, totalLoan }] = await Promise.all([
    getSaldoBebas(userId),
    getSavingsSummary(userId),
  ]);
  // Saldo Total = Saldo Bebas + Tabungan Tetap - Pinjaman Tabungan yang belum dikembalikan.
  // Pinjaman dikurangi di sini karena tampilan "Tabungan Tetap" per akun sengaja TIDAK
  // dikurangi (tetap tercatat sesuai instruksi awal), padahal uangnya sudah pindah ke
  // dompet (Saldo Bebas). Tanpa pengurangan ini, uang yang sama akan terhitung dua kali.
  const total = saldoBebas + totalSavings - totalLoan;
  return { saldoBebas, totalSavings, totalLoan, total };
}
