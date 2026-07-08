import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { listTransactions } from "@/lib/queries";
import { createTransaction } from "@/lib/actions";
import { toFormData } from "@/lib/form-data";

export async function GET(req: Request) {
  return withApiErrorHandling(async () => {
    const userId = await requireApiUserId();
    const { searchParams } = new URL(req.url);
    const transactions = await listTransactions(userId, {
      q: searchParams.get("q") ?? undefined,
      wallet: searchParams.get("wallet") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    });
    return apiOk({ transactions });
  });
}

const createSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  amount: z.number().positive("Nominal harus lebih dari 0"),
  type: z.enum(["income", "expense"]),
  walletId: z.string().min(1, "Dompet wajib dipilih"),
  categoryId: z.string().optional(),
  occurredAt: z.string().optional(), // ISO string; defaults to now
  note: z.string().optional(),
  tags: z.string().optional(),
  isDraft: z.boolean().optional(),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const body = createSchema.parse(await req.json());
    await createTransaction(toFormData({ ...body, isDraft: body.isDraft ? "true" : "false" }));
    return apiOk({ message: "Transaksi tercatat" }, 201);
  });
}
