import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { createTransfer } from "@/lib/actions";
import { toFormData } from "@/lib/form-data";

const schema = z.object({
  fromWalletId: z.string().min(1),
  toWalletId: z.string().min(1),
  amount: z.number().positive(),
  note: z.string().optional(),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const body = schema.parse(await req.json());
    await createTransfer(toFormData(body));
    return apiOk({ message: "Transfer berhasil" }, 201);
  });
}
