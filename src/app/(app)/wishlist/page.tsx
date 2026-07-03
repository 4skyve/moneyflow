import { auth } from "@/lib/auth";
import { db } from "@/db";
import { wishlistItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import PageHeader from "@/components/page-header";
import { formatIDR } from "@/lib/utils";
import { CreateWishlistForm, WishlistActions } from "./wishlist-forms";

const STATUS_LABEL: Record<string, string> = {
  wishing: "Ingin",
  saving: "Menabung",
  bought: "Sudah dibeli",
  cancelled: "Dibatalkan",
};

export default async function WishlistPage() {
  const session = await auth();
  const userId = (session?.user as any).id as string;
  const items = await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId)).orderBy(desc(wishlistItems.createdAt));

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-5">
      <PageHeader title="Wishlist" subtitle="Barang impian yang lagi kamu incar." />

      <div className="space-y-3">
        {items.map((it) => {
          const pct = Math.min(100, (parseFloat(it.currentAmount) / parseFloat(it.targetPrice)) * 100);
          return (
            <div key={it.id} className="mf-card p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold" style={{ color: "var(--text)" }}>{it.name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full mf-accent-soft-bg mf-accent-text font-semibold">
                  {STATUS_LABEL[it.status]}
                </span>
              </div>
              <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                {formatIDR(it.currentAmount)} / {formatIDR(it.targetPrice)}
              </p>
              <div className="h-2 rounded-full mb-3" style={{ background: "var(--card-bg-soft)" }}>
                <div className="h-2 rounded-full mf-accent-bg" style={{ width: `${pct}%` }} />
              </div>
              {it.status !== "bought" && <WishlistActions id={it.id} status={it.status} />}
            </div>
          );
        })}
      </div>

      <CreateWishlistForm />
    </div>
  );
}
