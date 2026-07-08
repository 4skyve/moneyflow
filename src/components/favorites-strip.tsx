"use client";

import { useTransition, useState } from "react";
import { useFavoriteAsTransaction, deleteFavorite } from "@/lib/actions";
import { toast } from "sonner";
import { formatIDR } from "@/lib/utils";
import { X } from "lucide-react";

type Fav = { id: string; emoji: string; title: string; amount: string };

export default function FavoritesStrip({ favorites }: { favorites: Fav[] }) {
  const [isPending, startTransition] = useTransition();
  const [editMode, setEditMode] = useState(false);

  if (favorites.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {favorites.map((f) => (
        <div key={f.id} className="relative shrink-0">
          <button
            disabled={isPending}
            onClick={() => {
              if (editMode) return;
              startTransition(async () => {
                await useFavoriteAsTransaction(f.id);
                toast.success(`${f.title} dicatat ✓`);
              });
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setEditMode(true);
            }}
            className="mf-card px-3 py-2 flex items-center gap-2 text-xs font-semibold disabled:opacity-50"
            style={{ color: "var(--text)" }}
          >
            <span>{f.emoji}</span>
            <span>{f.title}</span>
            <span style={{ color: "var(--text-muted)" }}>{formatIDR(f.amount)}</span>
          </button>
          {editMode && (
            <button
              onClick={() =>
                startTransition(async () => {
                  await deleteFavorite(f.id);
                  toast.success("Favorit dihapus");
                })
              }
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "var(--expense)", color: "#fff" }}
              aria-label="Hapus favorit"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => setEditMode(!editMode)}
        className="text-[10px] font-semibold px-2 shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        {editMode ? "Selesai" : "Kelola"}
      </button>
    </div>
  );
}
