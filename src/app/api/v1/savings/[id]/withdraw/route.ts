import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, apiError, withApiErrorHandling } from "@/lib/api-response";
import { withdrawFromSavings } from "@/lib/actions";
import { toFormData } from "@/lib/form-data";

const schema = z.object({
  walletId: z.string().min(1),
  amount: z.number().positive(),
  note: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const { id } = await params;
    const body = schema.parse(await req.json());
    try {
      await withdrawFromSavings(toFormData({ savingsAccountId: id, ...body }));
      return apiOk({ message: "Tabungan ditarik" }, 201);
    } catch (e: any) {
      return apiError(e.message ?? "Gagal menarik tabungan", 400);
    }
  });
}
