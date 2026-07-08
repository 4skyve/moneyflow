import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { updateWishlistProgress } from "@/lib/actions";

const schema = z.object({ amount: z.number() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const { id } = await params;
    const body = schema.parse(await req.json());
    await updateWishlistProgress(id, body.amount);
    return apiOk({ message: "Progress diperbarui" });
  });
}
