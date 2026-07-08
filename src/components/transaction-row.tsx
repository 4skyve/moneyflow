import { formatIDR, formatDateShort, formatTime } from "@/lib/utils";
import * as Icons from "lucide-react";
import DeleteTransactionButton from "@/components/delete-transaction-button";

export default function TransactionRow({
  id,
  title,
  amount,
  type,
  categoryName,
  walletName,
  occurredAt,
}: {
  id?: string;
  title: string;
  amount: string | number;
  type: "income" | "expense";
  categoryName?: string | null;
  categoryColor?: string | null;
  walletName?: string | null;
  occurredAt: Date | string;
}) {
  const Icon = type === "income" ? Icons.ArrowDownLeft : Icons.ArrowUpRight;
  return (
    <div className="flex items-center justify-between py-2.5 gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: type === "income" ? "var(--income-soft)" : "var(--expense-soft)" }}
        >
          <Icon size={16} color={type === "income" ? "var(--income)" : "var(--expense)"} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
            {title}
          </p>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {categoryName ?? "Tanpa kategori"} · {walletName} · {formatDateShort(occurredAt)} {formatTime(occurredAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="text-sm font-semibold"
          style={{ color: type === "income" ? "var(--income)" : "var(--expense)" }}
        >
          {type === "income" ? "+" : "-"}
          {formatIDR(amount)}
        </span>
        {id && <DeleteTransactionButton id={id} />}
      </div>
    </div>
  );
}
