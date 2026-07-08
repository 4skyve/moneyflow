import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { listRecurring } from "@/lib/queries";
import { createRecurring } from "@/lib/actions";
import { toFormData } from "@/lib/form-data";

export async function GET() {
  return withApiErrorHandling(async () => {
    const userId = await requireApiUserId();
    const recurring = await listRecurring(userId);
    return apiOk({ recurring });
  });
}

const schema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  dayOfMonth: z.number().min(1).max(28),
  categoryId: z.string().optional(),
  icon: z.string().optional(),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const body = schema.parse(await req.json());
    await createRecurring(toFormData(body));
    return apiOk({ message: "Reminder dibuat" }, 201);
  });
}
