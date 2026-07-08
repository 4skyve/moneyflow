"use client";

import ConfirmDeleteButton from "@/components/confirm-delete-button";
import { deleteTransaction } from "@/lib/actions";

export default function DeleteTransactionButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      onDelete={() => deleteTransaction(id)}
      successMessage="Transaksi dihapus"
      confirmLabel="Hapus?"
    />
  );
}
