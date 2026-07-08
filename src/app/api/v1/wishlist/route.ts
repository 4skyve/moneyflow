import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { listWishlist } from "@/lib/queries";
import { createWishlistItem } from "@/lib/actions";
import { toFormData } from "@/lib/form-data";

export async function GET() {
  return withApiErrorHandling(async () => {
    const userId = await requireApiUserId();
    const wishlist = await listWishlist(userId);
    return apiOk({ wishlist });
  });
}

const schema = z.object({
  name: z.string().min(1),
  targetPrice: z.number().positive(),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const body = schema.parse(await req.json());
    await createWishlistItem(toFormData(body));
    return apiOk({ message: "Ditambahkan ke wishlist" }, 201);
  });
}
