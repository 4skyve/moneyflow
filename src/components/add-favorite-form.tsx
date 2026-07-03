"use client";

import { useState, useTransition } from "react";
import { saveFavorite } from "@/lib/actions";
import { toast } from "sonner";
import { Star } from "lucide-react";

type Wallet = { id: string; name: string };
type Category = { id: string; name: string };

export default function AddFavoriteForm({ wallets, categories }: { wallets: Wallet[]; categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-semibold flex items-center gap-1 shrink-0" style={{ color: "var(--text-muted)" }}>
        <Star size={12} /> Simpan favorit
      </button>
    );

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          await saveFavorite(fd);
          setOpen(false);
          toast.success("Favorit disimpan");
        })
      }
      className="mf-card p-3 space-y-2"
    >
      <div className="grid grid-cols-3 gap-2">
        <input name="emoji" placeholder="🍜" defaultValue="⭐" className="mf-input text-center" />
        <input name="title" required placeholder="Judul" className="mf-input col-span-2" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="amount" type="number" step="0.01" required placeholder="Nominal" className="mf-input" />
        <select name="walletId" className="mf-input">
          {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>
      <select name="categoryId" className="mf-input">
        <option value="">Tanpa kategori</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="mf-accent-bg rounded-lg px-3 py-1.5 text-xs font-semibold flex-1">Simpan</button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs px-2" style={{ color: "var(--text-muted)" }}>Batal</button>
      </div>
    </form>
  );
}
