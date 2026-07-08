import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { deleteCategory } from "@/lib/actions";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const { id } = await params;
    await deleteCategory(id);
    return apiOk({ message: "Kategori dihapus" });
  });
}
