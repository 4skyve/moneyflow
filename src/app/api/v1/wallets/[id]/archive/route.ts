import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { archiveWallet } from "@/lib/actions";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const { id } = await params;
    await archiveWallet(id);
    return apiOk({ message: "Dompet diarsipkan" });
  });
}
