"use client";

import { useState, useTransition } from "react";
import { createWishlistItem, updateWishlistProgress, updateWishlistStatus, deleteWishlistItem } from "@/lib/actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import ConfirmDeleteButton from "@/components/confirm-delete-button";

export function DeleteWishlistButton({ id }: { id: string }) {
  return <ConfirmDeleteButton onDelete={() => deleteWishlistItem(id)} successMessage="Wishlist dihapus" />;
}

export function CreateWishlistForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="mf-card p-4 flex items-center justify-center gap-2 text-sm font-semibold w-full border-dashed" style={{ color: "var(--accent-strong)" }}>
        <Plus size={16} /> Tambah Wishlist
      </button>
    );
  return (
    <form action={(fd) => startTransition(async () => { await createWishlistItem(fd); setOpen(false); toast.success("Ditambahkan ke wishlist"); })} className="mf-card p-4 space-y-3">
      <input name="name" required placeholder="Nama barang" className="mf-input" />
      <input name="targetPrice" type="number" step="0.01" required placeholder="Harga target" className="mf-input" />
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="mf-accent-bg rounded-xl px-4 py-2 text-sm font-semibold flex-1">Simpan</button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm px-4" style={{ color: "var(--text-muted)" }}>Batal</button>
      </div>
    </form>
  );
}

export function WishlistActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex gap-3 text-xs font-semibold">
      <button onClick={() => startTransition(async () => { await updateWishlistProgress(id, 50000); toast.success("+Rp50.000 progress"); })} className="mf-accent-text">
        +Rp50rb
      </button>
      {status !== "bought" && (
        <button onClick={() => startTransition(async () => { await updateWishlistStatus(id, "bought"); toast.success("Selamat, sudah dibeli! 🎉"); })} style={{ color: "var(--income)" }}>
          Tandai dibeli
        </button>
      )}
    </div>
  );
}
