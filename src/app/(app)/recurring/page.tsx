import { auth } from "@/lib/auth";
import { db } from "@/db";
import { recurringExpenses } from "@/db/schema";
import { eq } from "drizzle-orm";
import PageHeader from "@/components/page-header";
import { formatIDR } from "@/lib/utils";
import RecurringForm, { ToggleButton, DeleteRecurringButton } from "./recurring-form";

export default async function RecurringPage() {
  const session = await auth();
  const userId = (session?.user as any).id as string;
  const list = await db.select().from(recurringExpenses).where(eq(recurringExpenses.userId, userId));

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-5">
      <PageHeader title="Pengeluaran Rutin" subtitle="Hanya reminder — tidak otomatis membuat transaksi." />

      <div className="space-y-2">
        {list.map((r) => (
          <div key={r.id} className="mf-card p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{r.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Setiap tanggal {r.dayOfMonth} · {formatIDR(r.amount)}</p>
            </div>
            <div className="flex items-center gap-3">
              <ToggleButton id={r.id} active={r.active} />
              <DeleteRecurringButton id={r.id} />
            </div>
          </div>
        ))}
      </div>

      <RecurringForm />
    </div>
  );
}
