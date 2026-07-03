"use client";

import { useState, useTransition } from "react";
import { createGoal, contributeToGoal } from "@/lib/actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type Wallet = { id: string; name: string };

export function CreateGoalForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="mf-card p-4 flex items-center justify-center gap-2 text-sm font-semibold w-full border-dashed" style={{ color: "var(--accent-strong)" }}>
        <Plus size={16} /> Buat Target Baru
      </button>
    );
  return (
    <form action={(fd) => startTransition(async () => { await createGoal(fd); setOpen(false); toast.success("Target dibuat"); })} className="mf-card p-4 space-y-3">
      <input name="name" required placeholder="Nama target, mis. Laptop" className="mf-input" />
      <input name="targetAmount" type="number" step="0.01" required placeholder="Target nominal" className="mf-input" />
      <select name="frequency" className="mf-input">
        <option value="weekly">Per Minggu</option>
        <option value="monthly">Per Bulan</option>
        <option value="custom">Custom</option>
      </select>
      <input name="deadline" type="date" className="mf-input" />
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="mf-accent-bg rounded-xl px-4 py-2 text-sm font-semibold flex-1">Simpan</button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm px-4" style={{ color: "var(--text-muted)" }}>Batal</button>
      </div>
    </form>
  );
}

export function ContributeForm({ goalId, wallets }: { goalId: string; wallets: Wallet[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="text-xs font-semibold mf-accent-text">+ Tambah progress</button>
      {open && (
        <form action={(fd) => { fd.set("goalId", goalId); startTransition(async () => { await contributeToGoal(fd); setOpen(false); toast.success("Progress ditambahkan"); }); }} className="mt-2 space-y-2 mf-card p-3">
          <select name="walletId" required className="mf-input text-xs">{wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          <input name="amount" type="number" step="0.01" required placeholder="Nominal" className="mf-input text-xs" />
          <button type="submit" disabled={isPending} className="mf-accent-bg rounded-lg px-3 py-1.5 text-xs font-semibold w-full">Tambah</button>
        </form>
      )}
    </div>
  );
}
