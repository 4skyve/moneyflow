"use client";

import { useState, useTransition } from "react";
import { createRecurring, toggleRecurring, deleteRecurring } from "@/lib/actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import ConfirmDeleteButton from "@/components/confirm-delete-button";

export default function RecurringForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="mf-card p-4 flex items-center justify-center gap-2 text-sm font-semibold w-full border-dashed" style={{ color: "var(--accent-strong)" }}>
        <Plus size={16} /> Tambah Pengeluaran Rutin
      </button>
    );
  return (
    <form action={(fd) => startTransition(async () => { await createRecurring(fd); setOpen(false); toast.success("Reminder dibuat"); })} className="mf-card p-4 space-y-3">
      <input name="name" required placeholder="Nama, mis. Netflix" className="mf-input" />
      <div className="grid grid-cols-2 gap-2">
        <input name="amount" type="number" step="0.01" required placeholder="Nominal" className="mf-input" />
        <input name="dayOfMonth" type="number" min={1} max={28} required placeholder="Tanggal (1-28)" className="mf-input" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="mf-accent-bg rounded-xl px-4 py-2 text-sm font-semibold flex-1">Simpan</button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm px-4" style={{ color: "var(--text-muted)" }}>Batal</button>
      </div>
    </form>
  );
}

export function DeleteRecurringButton({ id }: { id: string }) {
  return <ConfirmDeleteButton onDelete={() => deleteRecurring(id)} successMessage="Reminder dihapus" />;
}

export function ToggleButton({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => toggleRecurring(id, !active))}
      className="text-xs font-semibold px-3 py-1.5 rounded-full"
      style={{ background: active ? "var(--accent-soft)" : "var(--card-bg-soft)", color: active ? "var(--accent-strong)" : "var(--text-muted)" }}
    >
      {active ? "Aktif" : "Nonaktif"}
    </button>
  );
}
