import { auth } from "@/lib/auth";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import PageHeader from "@/components/page-header";
import CategoryForm from "./category-form";

export default async function CategoriesPage() {
  const session = await auth();
  const userId = (session?.user as any).id as string;
  const list = await db.select().from(categories).where(eq(categories.userId, userId));

  const expense = list.filter((c) => c.type === "expense");
  const income = list.filter((c) => c.type === "income");

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
      <PageHeader title="Kategori" subtitle="Kelola kategori pemasukan & pengeluaranmu sendiri." />
      <CategoryForm />

      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>PENGELUARAN</p>
        <div className="flex flex-wrap gap-2">
          {expense.map((c) => (
            <span key={c.id} className="mf-card px-3 py-1.5 text-sm" style={{ color: "var(--text)" }}>
              {c.name}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>PEMASUKAN</p>
        <div className="flex flex-wrap gap-2">
          {income.map((c) => (
            <span key={c.id} className="mf-card px-3 py-1.5 text-sm" style={{ color: "var(--text)" }}>
              {c.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
