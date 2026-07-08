import { auth } from "@/lib/auth";
import { db } from "@/db";
import { wallets, savingsLoans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSavingsSummary } from "@/lib/balance";
import PageHeader from "@/components/page-header";
import { formatIDR } from "@/lib/utils";
import { CreateSavingsForm, MoveToSavingsForm, BorrowForm, ReturnLoanForm, DetailForm, DeleteSavingsAccountButton } from "./savings-forms";
import { deleteSavingsDetail } from "@/lib/actions";
import { X } from "lucide-react";

export default async function SavingsPage() {
  const session = await auth();
  const userId = (session?.user as any).id as string;
  const [{ accounts, totalSavings, totalLoan }, userWallets, allLoans] = await Promise.all([
    getSavingsSummary(userId),
    db.select({ id: wallets.id, name: wallets.name }).from(wallets).where(eq(wallets.userId, userId)),
    db.select().from(savingsLoans).where(eq(savingsLoans.userId, userId)),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-5">
      <PageHeader title="Tabungan" subtitle="Uang yang sengaja disimpan, terpisah dari saldo bebas." />

      <div className="grid grid-cols-2 gap-4">
        <div className="mf-card p-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Tabungan Tetap</p>
          <p className="font-display text-lg font-semibold mt-1" style={{ color: "var(--text)" }}>{formatIDR(totalSavings)}</p>
        </div>
        <div className="mf-card p-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Pinjaman Tabungan</p>
          <p className="font-display text-lg font-semibold mt-1" style={{ color: totalLoan > 0 ? "var(--expense)" : "var(--text)" }}>{formatIDR(totalLoan)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {accounts.map((acc) => {
          const accLoans = allLoans.filter((l) => l.savingsAccountId === acc.id && parseFloat(l.amountReturned) < parseFloat(l.amount));
          return (
            <div key={acc.id} className="mf-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold" style={{ color: "var(--text)" }}>{acc.name}</p>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold mf-accent-text">{formatIDR(acc.savedAmount)}</p>
                  <DeleteSavingsAccountButton id={acc.id} hasLoan={acc.outstandingLoan > 0} />
                </div>
              </div>

              {acc.outstandingLoan > 0 && (
                <p className="text-xs mb-2" style={{ color: "var(--expense)" }}>
                  Pinjaman berjalan: {formatIDR(acc.outstandingLoan)}
                </p>
              )}

              {acc.details.length > 0 && (
                <div className="space-y-1 mb-3 pl-1">
                  {acc.details.map((d) => (
                    <div key={d.id} className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>↳ {d.label}</span>
                      <span className="flex items-center gap-2">
                        {formatIDR(d.amount)}
                        <form action={async () => { "use server"; await deleteSavingsDetail(d.id); }}>
                          <button type="submit"><X size={12} /></button>
                        </form>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <MoveToSavingsForm savingsAccountId={acc.id} wallets={userWallets} hasOutstandingLoan={acc.outstandingLoan > 0} />
                <BorrowForm savingsAccountId={acc.id} wallets={userWallets} />
                <DetailForm savingsAccountId={acc.id} />
              </div>

              {accLoans.length > 0 && (
                <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
                  {accLoans.map((l) => {
                    const remaining = parseFloat(l.amount) - parseFloat(l.amountReturned);
                    return (
                      <div key={l.id} className="flex items-center justify-between text-xs">
                        <span style={{ color: "var(--text-muted)" }}>Sisa pinjaman: {formatIDR(remaining)}</span>
                        <ReturnLoanForm loanId={l.id} wallets={userWallets} remaining={remaining} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CreateSavingsForm />
    </div>
  );
}
