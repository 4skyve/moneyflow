import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { contributeToGoal } from "@/lib/actions";
import { toFormData } from "@/lib/form-data";

const schema = z.object({
  walletId: z.string().min(1),
  amount: z.number().positive(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const { id } = await params;
    const body = schema.parse(await req.json());
    await contributeToGoal(toFormData({ goalId: id, ...body }));
    return apiOk({ message: "Progress ditambahkan" });
  });
}
