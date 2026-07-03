"use client";

import { useState, useTransition } from "react";
import { createCategory } from "@/lib/actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function CategoryForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="mf-card p-3 flex items-center justify-center gap-2 text-sm font-semibold w-full" style={{ color: "var(--accent-strong)" }}>
        <Plus size={16} /> Tambah Kategori
      </button>
    );

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          await createCategory(fd);
          setOpen(false);
          toast.success("Kategori dibuat");
        })
      }
      className="mf-card p-4 space-y-3"
    >
      <input name="name" required placeholder="Nama kategori" className="mf-input" />
      <select name="type" className="mf-input">
        <option value="expense">Pengeluaran</option>
        <option value="income">Pemasukan</option>
      </select>
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="mf-accent-bg rounded-xl px-4 py-2 text-sm font-semibold flex-1">
          Simpan
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm px-4" style={{ color: "var(--text-muted)" }}>
          Batal
        </button>
      </div>
    </form>
  );
}
