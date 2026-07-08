"use client";

import ConfirmDeleteButton from "@/components/confirm-delete-button";
import { deleteNote } from "@/lib/actions";

export default function DeleteNoteButton({ id }: { id: string }) {
  return <ConfirmDeleteButton onDelete={() => deleteNote(id)} successMessage="Catatan dihapus" />;
}
