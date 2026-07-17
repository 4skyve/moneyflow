"use client";

import { useState, useTransition } from "react";
import { createSavingsAccount, borrowFromSavings, withdrawFromSavings, returnLoan, addSavingsDetail, deleteSavingsAccount, moveBalanceToSavings } from "@/lib/actions";
import { toast } from "sonner";
import { Plus, ArrowDownToLine, ArrowUpFromLine, ListPlus, Wallet as WalletIcon } from "lucide-react";

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
      <div>
        <input name="startingBalance" type="number" step="0.01" placeholder="Saldo awal (opsional)" className="mf-input" />
        <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
          Isi kalau kamu sudah punya tabungan ini sebelumnya (di luar dompet manapun di app ini) — nominal ini
          TIDAK akan mengurangi Saldo Bebas.
        </p>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="mf-accent-bg rounded-xl px-4 py-2 text-sm font-semibold flex-1">Simpan</button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm px-4" style={{ color: "var(--text-muted)" }}>Batal</button>
      </div>
    </form>
  );
}

export function MoveToSavingsForm({ savingsAccountId, wallets, hasOutstandingLoan }: { savingsAccountId: string; wallets: Wallet[]; hasOutstandingLoan: boolean }) {
  const [open, setOpen] = useState(false);
  const [purpose, setPurpose] = useState<"deposit" | "repay_loan">("deposit");
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <button onClick={() => setOpen(!open)} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 mf-accent-soft-bg mf-accent-text">
        <ArrowDownToLine size={14} /> Pindahkan Saldo
      </button>
      {open && (
        <form
          action={(fd) => {
            fd.set("savingsAccountId", savingsAccountId);
            fd.set("purpose", purpose);
            startTransition(async () => {
              try {
                await moveBalanceToSavings(fd);
                setOpen(false);
                toast.success(purpose === "repay_loan" ? "Pinjaman dibayar" : "Berhasil menyetor");
              } catch (e: any) {
                toast.error(e.message ?? "Gagal memindahkan saldo");
              }
            });
          }}
          className="mt-2 space-y-2 mf-card p-3"
        >
          {hasOutstandingLoan && (
            <div className="flex rounded-full p-1 text-[11px] font-semibold" style={{ background: "var(--card-bg-soft)" }}>
              <button
                type="button"
                onClick={() => setPurpose("deposit")}
                className="flex-1 px-2 py-1 rounded-full transition"
                style={{ background: purpose === "deposit" ? "var(--accent)" : "transparent", color: purpose === "deposit" ? "#fff" : "var(--text-muted)" }}
              >
                Nambah Tabungan
              </button>
              <button
                type="button"
                onClick={() => setPurpose("repay_loan")}
                className="flex-1 px-2 py-1 rounded-full transition"
                style={{ background: purpose === "repay_loan" ? "var(--accent)" : "transparent", color: purpose === "repay_loan" ? "#fff" : "var(--text-muted)" }}
              >
                Bayar Pinjaman
              </button>
            </div>
          )}
          <select name="walletId" required className="mf-input text-xs">
            {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <input name="amount" type="number" step="0.01" required placeholder="Nominal" className="mf-input text-xs" />
          <button type="submit" disabled={isPending} className="mf-accent-bg rounded-lg px-3 py-1.5 text-xs font-semibold w-full">
            {purpose === "repay_loan" ? "Bayar Pinjaman" : "Setor"}
          </button>
        </form>
      )}
    </div>
  );
}

export function WithdrawForm({ savingsAccountId, wallets, available }: { savingsAccountId: string; wallets: Wallet[]; available: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: "var(--card-bg-soft)", color: "var(--text)" }}>
        <WalletIcon size={14} /> Gunakan Tabungan
      </button>
      {open && (
        <form
          action={(fd) => {
            fd.set("savingsAccountId", savingsAccountId);
            startTransition(async () => {
              try {
                await withdrawFromSavings(fd);
                setOpen(false);
                toast.success("Tabungan ditarik & dipakai — catatan tabungan berkurang permanen");
              } catch (e: any) {
                toast.error(e.message ?? "Gagal menarik tabungan");
              }
            });
          }}
          className="mt-2 space-y-2 mf-card p-3"
        >
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Beda dengan "Ambil (Pinjam)": ini penarikan PERMANEN, tidak jadi hutang, dan langsung mengurangi
            catatan Tabungan Tetap. Maks bisa ditarik: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(available)}.
          </p>
          <select name="walletId" required className="mf-input text-xs">
            {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <input name="amount" type="number" step="0.01" max={available} required placeholder="Nominal" className="mf-input text-xs" />
          <button type="submit" disabled={isPending} className="rounded-lg px-3 py-1.5 text-xs font-semibold w-full text-white" style={{ background: "var(--text)" }}>
            Tarik & Gunakan
          </button>
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
      <button onClick={() => setOpen(!open)} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: "var(--expense-soft)", color: "var(--expense)" }}>
        <ArrowUpFromLine size={14} /> Ambil (Pinjam)
      </button>
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
      <button onClick={() => setOpen(!open)} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: "var(--card-bg-soft)", color: "var(--text-muted)" }}>
        <ListPlus size={14} /> Rincian
      </button>
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
