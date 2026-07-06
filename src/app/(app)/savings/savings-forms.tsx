"use client";

import { useState, useTransition } from "react";
import { createSavingsAccount, depositToSavings, borrowFromSavings, returnLoan, addSavingsDetail, deleteSavingsAccount } from "@/lib/actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type Wallet = { id: string; name: string };

export function CreateSavingsForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="mf-card p-4 flex items-center justify-center gap-2 text-sm font-semibold w-full border-dashed" style={{ color: "var(--accent-strong)" }}>
        <Plus size={16} /> Buat Tabungan Baru
      </button>
    );
  return (
    <form action={(fd) => startTransition(async () => { await createSavingsAccount(fd); setOpen(false); toast.success("Tabungan dibuat"); })} className="mf-card p-4 space-y-3">
      <input name="name" required placeholder="Nama tabungan, mis. Laptop Baru" className="mf-input" />
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="mf-accent-bg rounded-xl px-4 py-2 text-sm font-semibold flex-1">Simpan</button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm px-4" style={{ color: "var(--text-muted)" }}>Batal</button>
      </div>
    </form>
  );
}

export function DepositForm({ savingsAccountId, wallets }: { savingsAccountId: string; wallets: Wallet[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="text-xs font-semibold mf-accent-text">+ Setor</button>
      {open && (
        <form action={(fd) => { fd.set("savingsAccountId", savingsAccountId); startTransition(async () => { await depositToSavings(fd); setOpen(false); toast.success("Berhasil menyetor"); }); }} className="mt-2 space-y-2 mf-card p-3">
          <select name="walletId" required className="mf-input text-xs">{wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          <input name="amount" type="number" step="0.01" required placeholder="Nominal" className="mf-input text-xs" />
          <button type="submit" disabled={isPending} className="mf-accent-bg rounded-lg px-3 py-1.5 text-xs font-semibold w-full">Setor</button>
        </form>
      )}
    </div>
  );
}

export function BorrowForm({ savingsAccountId, wallets }: { savingsAccountId: string; wallets: Wallet[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="text-xs font-semibold" style={{ color: "var(--expense)" }}>+ Ambil (Pinjam)</button>
      {open && (
        <form action={(fd) => { fd.set("savingsAccountId", savingsAccountId); startTransition(async () => { await borrowFromSavings(fd); setOpen(false); toast.success("Uang dipindah ke dompet, tercatat sebagai pinjaman"); }); }} className="mt-2 space-y-2 mf-card p-3">
          <select name="walletId" required className="mf-input text-xs">{wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          <input name="amount" type="number" step="0.01" required placeholder="Nominal" className="mf-input text-xs" />
          <button type="submit" disabled={isPending} className="rounded-lg px-3 py-1.5 text-xs font-semibold w-full text-white" style={{ background: "var(--expense)" }}>Ambil</button>
        </form>
      )}
    </div>
  );
}

export function ReturnLoanForm({ loanId, wallets, remaining }: { loanId: string; wallets: Wallet[]; remaining: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="text-xs font-semibold mf-accent-text">Kembalikan</button>
      {open && (
        <form action={(fd) => { fd.set("loanId", loanId); startTransition(async () => { await returnLoan(fd); setOpen(false); toast.success("Pinjaman dikembalikan"); }); }} className="mt-2 space-y-2 mf-card p-3">
          <select name="walletId" required className="mf-input text-xs">{wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          <input name="amount" type="number" step="0.01" max={remaining} required placeholder={`Maks ${remaining}`} className="mf-input text-xs" />
          <button type="submit" disabled={isPending} className="mf-accent-bg rounded-lg px-3 py-1.5 text-xs font-semibold w-full">Bayar</button>
        </form>
      )}
    </div>
  );
}

export function DeleteSavingsAccountButton({ id, hasLoan }: { id: string; hasLoan: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (hasLoan) {
    return (
      <span className="text-xs" style={{ color: "var(--text-muted)" }} title="Lunasi pinjaman dulu sebelum menghapus">
        —
      </span>
    );
  }

  if (!confirming)
    return (
      <button onClick={() => setConfirming(true)} className="text-xs font-semibold" style={{ color: "var(--expense)" }}>
        Hapus
      </button>
    );

  return (
    <span className="flex items-center gap-2 text-xs">
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              await deleteSavingsAccount(id);
              toast.success("Tabungan dihapus");
            } catch (e: any) {
              toast.error(e.message ?? "Gagal menghapus");
            }
          })
        }
        className="font-semibold"
        style={{ color: "var(--expense)" }}
      >
        Yakin hapus?
      </button>
      <button onClick={() => setConfirming(false)} style={{ color: "var(--text-muted)" }}>
        Batal
      </button>
    </span>
  );
}

export function DetailForm({ savingsAccountId }: { savingsAccountId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>+ Rincian</button>
      {open && (
        <form action={(fd) => { fd.set("savingsAccountId", savingsAccountId); startTransition(async () => { await addSavingsDetail(fd); setOpen(false); }); }} className="mt-2 space-y-2 mf-card p-3">
          <input name="label" required placeholder="Mis. Bank BCA" className="mf-input text-xs" />
          <input name="amount" type="number" step="0.01" required placeholder="Nominal" className="mf-input text-xs" />
          <button type="submit" disabled={isPending} className="mf-accent-bg rounded-lg px-3 py-1.5 text-xs font-semibold w-full">Tambah</button>
        </form>
      )}
    </div>
  );
}
