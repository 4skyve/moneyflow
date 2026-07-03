import { auth } from "@/lib/auth";
import { getWalletBalances } from "@/lib/balance";
import PageHeader from "@/components/page-header";
import { formatIDR } from "@/lib/utils";
import { CreateWalletForm, TransferForm, AdjustBalanceForm } from "./wallet-forms";
import { Wallet as WalletIcon } from "lucide-react";

export default async function WalletsPage() {
  const session = await auth();
  const userId = (session?.user as any).id as string;
  const walletBalances = await getWalletBalances(userId);
  const total = walletBalances.reduce((s, w) => s + w.balance, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-5">
      <PageHeader title="Dompet" subtitle={`Total saldo bebas: ${formatIDR(total)}`} />

      <div className="grid sm:grid-cols-2 gap-3">
        {walletBalances.map((w) => (
          <div key={w.id} className="mf-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mf-accent-soft-bg">
              <WalletIcon size={18} className="mf-accent-text" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {w.name}
              </p>
              <p className="text-sm" style={{ color: w.balance < 0 ? "var(--expense)" : "var(--text-muted)" }}>
                {formatIDR(w.balance)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <CreateWalletForm />

      {walletBalances.length > 0 && (
        <div className="space-y-3">
          <TransferForm wallets={walletBalances} />
          <AdjustBalanceForm wallets={walletBalances} />
        </div>
      )}
    </div>
  );
}
