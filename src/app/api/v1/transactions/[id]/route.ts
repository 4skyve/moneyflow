import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { deleteTransaction } from "@/lib/actions";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const { id } = await params;
    await deleteTransaction(id);
    return apiOk({ message: "Transaksi dihapus" });
  });
}
