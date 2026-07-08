"use client";

import { useState, useTransition } from "react";
import { createWallet, createTransfer, createAdjustment, archiveWallet } from "@/lib/actions";
import { toast } from "sonner";
import { Plus, ArrowRightLeft, SlidersHorizontal } from "lucide-react";
import ConfirmDeleteButton from "@/components/confirm-delete-button";

export function ArchiveWalletButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      onDelete={() => archiveWallet(id)}
      successMessage="Dompet diarsipkan"
      confirmLabel="Arsipkan?"
    />
  );
}

type Wallet = { id: string; name: string; balance: number };

export function CreateWalletForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="mf-card p-4 flex items-center gap-2 text-sm font-semibold w-full justify-center border-dashed"
        style={{ color: "var(--accent-strong)" }}
      >
        <Plus size={16} /> Tambah Dompet
      </button>
    );

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          await createWallet(fd);
          setOpen(false);
          toast.success("Dompet dibuat");
        })
      }
      className="mf-card p-4 space-y-3"
    >
      <input name="name" required placeholder="Nama dompet, mis. DANA" className="mf-input" />
      <input name="startingBalance" type="number" step="0.01" placeholder="Saldo awal (opsional)" className="mf-input" />
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

export function TransferForm({ wallets }: { wallets: Wallet[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mf-card p-4">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm font-semibold w-full" style={{ color: "var(--text)" }}>
        <ArrowRightLeft size={16} className="mf-accent-text" /> Transfer Antar Dompet
      </button>
      {open && (
        <form
          action={(fd) =>
            startTransition(async () => {
              await createTransfer(fd);
              setOpen(false);
              toast.success("Transfer berhasil");
            })
          }
          className="mt-3 space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <select name="fromWalletId" required className="mf-input">
              {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select name="toWalletId" required className="mf-input">
              {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <input name="amount" type="number" step="0.01" required placeholder="Nominal" className="mf-input" />
          <input name="note" placeholder="Catatan (opsional)" className="mf-input" />
          <button type="submit" disabled={isPending} className="mf-accent-bg rounded-xl px-4 py-2 text-sm font-semibold w-full">
            Transfer
          </button>
        </form>
      )}
    </div>
  );
}

export function AdjustBalanceForm({ wallets }: { wallets: Wallet[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mf-card p-4">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm font-semibold w-full" style={{ color: "var(--text)" }}>
        <SlidersHorizontal size={16} className="mf-accent-text" /> Penyesuaian Saldo
      </button>
      {open && (
        <form
          action={(fd) =>
            startTransition(async () => {
              await createAdjustment(fd);
              setOpen(false);
              toast.success("Saldo disesuaikan");
            })
          }
          className="mt-3 space-y-3"
        >
          <select name="walletId" required className="mf-input">
            {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <input name="amount" type="number" step="0.01" required placeholder="Nominal (+/-), mis. -15000" className="mf-input" />
          <input name="reason" placeholder="Alasan, mis. Lupa catat jajan" className="mf-input" />
          <button type="submit" disabled={isPending} className="mf-accent-bg rounded-xl px-4 py-2 text-sm font-semibold w-full">
            Sesuaikan
          </button>
        </form>
      )}
    </div>
  );
}
