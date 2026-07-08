import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { listCategories } from "@/lib/queries";
import { createCategory } from "@/lib/actions";
import { toFormData } from "@/lib/form-data";

export async function GET() {
  return withApiErrorHandling(async () => {
    const userId = await requireApiUserId();
    const categories = await listCategories(userId);
    return apiOk({ categories });
  });
}

const schema = z.object({
  name: z.string().min(1),
  type: z.enum(["income", "expense"]),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const body = schema.parse(await req.json());
    await createCategory(toFormData(body));
    return apiOk({ message: "Kategori dibuat" }, 201);
  });
}
