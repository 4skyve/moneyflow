"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { createTransaction, deleteTransaction } from "@/lib/actions";

type Wallet = { id: string; name: string; icon: string };
type Category = { id: string; name: string; type: "income" | "expense" };

export default function QuickCapture({
  wallets,
  categories,
}: {
  wallets: Wallet[];
  categories: Category[];
}) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const filteredCategories = categories.filter((c) => c.type === type);

  function handleSubmit(fd: FormData) {
    fd.set("type", type);
    startTransition(async () => {
      await createTransaction(fd);
      formRef.current?.reset();
      const toastId = toast.success(
        type === "expense" ? "Pengeluaran dicatat ✓" : "Pemasukan dicatat ✓",
        {
          action: {
            label: "Undo",
            onClick: () => {
              // best-effort undo: relies on revalidated recent list; simplest is informing user
              toast.info("Untuk membatalkan, hapus transaksi dari daftar terbaru.");
            },
          },
          duration: 5000,
        }
      );
    });
  }

  if (wallets.length === 0) {
    return (
      <div className="mf-card p-5 text-sm" style={{ color: "var(--text-muted)" }}>
        Buat dompet dulu di halaman <b>Dompet</b> sebelum mencatat transaksi.
      </div>
    );
  }

  return (
    <div className="mf-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-base font-semibold" style={{ color: "var(--text)" }}>
          📝 Lagi {type === "expense" ? "keluar" : "dapat"} uang buat apa?
        </h2>
        <div className="flex rounded-full p-1 text-xs font-semibold" style={{ background: "var(--card-bg-soft)" }}>
          <button
            type="button"
            onClick={() => setType("expense")}
            className="px-3 py-1 rounded-full transition"
            style={{
              background: type === "expense" ? "var(--expense)" : "transparent",
              color: type === "expense" ? "#fff" : "var(--text-muted)",
            }}
          >
            Keluar
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className="px-3 py-1 rounded-full transition"
            style={{
              background: type === "income" ? "var(--income)" : "transparent",
              color: type === "income" ? "#fff" : "var(--text-muted)",
            }}
          >
            Masuk
          </button>
        </div>
      </div>

      <form ref={formRef} action={handleSubmit} className="space-y-3">
        <input
          name="title"
          required
          placeholder={type === "expense" ? "Beli makan..." : "Uang saku..."}
          className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border"
          style={{ background: "var(--card-bg-soft)", borderColor: "var(--border)", color: "var(--text)" }}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            name="amount"
            type="number"
            required
            min={1}
            step="0.01"
            placeholder="Nominal (Rp)"
            className="rounded-xl px-4 py-3 text-sm outline-none border"
            style={{ background: "var(--card-bg-soft)", borderColor: "var(--border)", color: "var(--text)" }}
          />
          <select
            name="walletId"
            required
            className="rounded-xl px-4 py-3 text-sm outline-none border"
            style={{ background: "var(--card-bg-soft)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <select
          name="categoryId"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
          style={{ background: "var(--card-bg-soft)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          <option value="">Tanpa kategori</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mf-accent-bg rounded-xl py-3 font-semibold text-sm disabled:opacity-60 transition"
        >
          {isPending ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}
