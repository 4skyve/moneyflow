import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { getSavingsSummary } from "@/lib/balance";
import { createSavingsAccount } from "@/lib/actions";
import { toFormData } from "@/lib/form-data";

export async function GET() {
  return withApiErrorHandling(async () => {
    const userId = await requireApiUserId();
    const summary = await getSavingsSummary(userId);
    return apiOk(summary);
  });
}

const schema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const body = schema.parse(await req.json());
    await createSavingsAccount(toFormData(body));
    return apiOk({ message: "Tabungan dibuat" }, 201);
  });
}
