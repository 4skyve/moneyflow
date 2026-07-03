"use client";

import { useRef, useTransition } from "react";
import { createNote } from "@/lib/actions";
import { toast } from "sonner";
import { NotebookPen } from "lucide-react";

export default function NoteForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={ref}
      action={(fd) =>
        startTransition(async () => {
          if (!fd.get("content")) return;
          await createNote(fd);
          ref.current?.reset();
          toast.success("Catatan disimpan");
        })
      }
      className="mf-card p-3 flex items-center gap-2"
    >
      <NotebookPen size={16} style={{ color: "var(--text-muted)" }} />
      <input
        name="content"
        placeholder='Tulis catatan harian, mis. "Hari ini gak jajan sama sekali"'
        className="flex-1 bg-transparent text-sm outline-none"
        style={{ color: "var(--text)" }}
      />
      <button
        type="submit"
        disabled={isPending}
        className="text-xs font-semibold mf-accent-text disabled:opacity-50"
      >
        Simpan
      </button>
    </form>
  );
}
