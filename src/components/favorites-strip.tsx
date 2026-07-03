"use client";

import { useTransition } from "react";
import { useFavoriteAsTransaction } from "@/lib/actions";
import { toast } from "sonner";
import { formatIDR } from "@/lib/utils";

type Fav = { id: string; emoji: string; title: string; amount: string };

export default function FavoritesStrip({ favorites }: { favorites: Fav[] }) {
  const [isPending, startTransition] = useTransition();
  if (favorites.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {favorites.map((f) => (
        <button
          key={f.id}
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await useFavoriteAsTransaction(f.id);
              toast.success(`${f.title} dicatat ✓`);
            })
          }
          className="mf-card px-3 py-2 flex items-center gap-2 shrink-0 text-xs font-semibold disabled:opacity-50"
          style={{ color: "var(--text)" }}
        >
          <span>{f.emoji}</span>
          <span>{f.title}</span>
          <span style={{ color: "var(--text-muted)" }}>{formatIDR(f.amount)}</span>
        </button>
      ))}
    </div>
  );
}
