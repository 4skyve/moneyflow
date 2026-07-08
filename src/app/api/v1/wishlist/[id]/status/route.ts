import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { updateWishlistStatus } from "@/lib/actions";

const schema = z.object({ status: z.enum(["wishing", "saving", "bought", "cancelled"]) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const { id } = await params;
    const body = schema.parse(await req.json());
    await updateWishlistStatus(id, body.status);
    return apiOk({ message: "Status diperbarui" });
  });
}
