import { auth } from "@/lib/auth";
import { db } from "@/db";
import { savingsGoals, wallets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import PageHeader from "@/components/page-header";
import { formatIDR, formatDateFull } from "@/lib/utils";
import { CreateGoalForm, ContributeForm, DeleteGoalButton } from "./goal-forms";

export default async function GoalsPage() {
  const session = await auth();
  const userId = (session?.user as any).id as string;
  const [goals, userWallets] = await Promise.all([
    db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId)).orderBy(desc(savingsGoals.createdAt)),
    db.select({ id: wallets.id, name: wallets.name }).from(wallets).where(eq(wallets.userId, userId)),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-5">
      <PageHeader title="Target Menabung" subtitle="Progress dihitung otomatis, tidak ada auto-transfer." />

      <div className="space-y-3">
        {goals.map((g) => {
          const pct = Math.min(100, (parseFloat(g.currentAmount) / parseFloat(g.targetAmount)) * 100);
          return (
            <div key={g.id} className="mf-card p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold" style={{ color: "var(--text)" }}>
                  {g.achieved ? "🎉 " : ""}{g.name}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full mf-accent-soft-bg mf-accent-text font-semibold">
                    {g.frequency === "weekly" ? "Mingguan" : g.frequency === "monthly" ? "Bulanan" : "Custom"}
                  </span>
                  <DeleteGoalButton id={g.id} />
                </div>
              </div>
              <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                {formatIDR(g.currentAmount)} dari {formatIDR(g.targetAmount)}
                {g.deadline ? ` · target ${formatDateFull(g.deadline)}` : ""}
              </p>
              <div className="h-2.5 rounded-full mb-3" style={{ background: "var(--card-bg-soft)" }}>
                <div className="h-2.5 rounded-full mf-accent-bg" style={{ width: `${pct}%` }} />
              </div>
              {!g.achieved && <ContributeForm goalId={g.id} wallets={userWallets} />}
            </div>
          );
        })}
      </div>

      <CreateGoalForm />
    </div>
  );
}
