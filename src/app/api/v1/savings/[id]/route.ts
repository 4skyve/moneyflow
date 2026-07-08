import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { deleteSavingsAccount } from "@/lib/actions";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const { id } = await params;
    await deleteSavingsAccount(id);
    return apiOk({ message: "Tabungan dihapus" });
  });
}
