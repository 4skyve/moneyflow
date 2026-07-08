"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function ConfirmDeleteButton({
  onDelete,
  confirmLabel = "Yakin hapus?",
  successMessage = "Berhasil dihapus",
  size = 14,
  className = "",
}: {
  onDelete: () => Promise<void>;
  confirmLabel?: string;
  successMessage?: string;
  size?: number;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming)
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setConfirming(true);
        }}
        className={`shrink-0 ${className}`}
        style={{ color: "var(--text-muted)" }}
        aria-label="Hapus"
      >
        <Trash2 size={size} />
      </button>
    );

  return (
    <span className="flex items-center gap-2 text-xs shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              await onDelete();
              toast.success(successMessage);
            } catch (e: any) {
              toast.error(e.message ?? "Gagal menghapus");
            } finally {
              setConfirming(false);
            }
          })
        }
        className="font-semibold"
        style={{ color: "var(--expense)" }}
      >
        {confirmLabel}
      </button>
      <button type="button" onClick={() => setConfirming(false)} style={{ color: "var(--text-muted)" }}>
        Batal
      </button>
    </span>
  );
}
