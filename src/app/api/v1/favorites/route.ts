import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { listFavorites } from "@/lib/queries";
import { saveFavorite } from "@/lib/actions";
import { toFormData } from "@/lib/form-data";

export async function GET() {
  return withApiErrorHandling(async () => {
    const userId = await requireApiUserId();
    const favorites = await listFavorites(userId);
    return apiOk({ favorites });
  });
}

const schema = z.object({
  emoji: z.string().optional(),
  title: z.string().min(1),
  amount: z.number().positive(),
  categoryId: z.string().optional(),
  walletId: z.string().optional(),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const body = schema.parse(await req.json());
    await saveFavorite(toFormData(body));
    return apiOk({ message: "Favorit disimpan" }, 201);
  });
}
