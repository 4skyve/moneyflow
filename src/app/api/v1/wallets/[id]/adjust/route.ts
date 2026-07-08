import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { createAdjustment } from "@/lib/actions";
import { toFormData } from "@/lib/form-data";

const schema = z.object({
  amount: z.number(),
  reason: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const { id } = await params;
    const body = schema.parse(await req.json());
    await createAdjustment(toFormData({ walletId: id, ...body }));
    return apiOk({ message: "Saldo disesuaikan" });
  });
}
