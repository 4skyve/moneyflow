import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { useFavoriteAsTransaction } from "@/lib/actions";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const { id } = await params;
    await useFavoriteAsTransaction(id);
    return apiOk({ message: "Transaksi dicatat dari favorit" }, 201);
  });
}
