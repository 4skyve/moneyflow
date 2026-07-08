import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { listGoals } from "@/lib/queries";
import { createGoal } from "@/lib/actions";
import { toFormData } from "@/lib/form-data";

export async function GET() {
  return withApiErrorHandling(async () => {
    const userId = await requireApiUserId();
    const goals = await listGoals(userId);
    return apiOk({ goals });
  });
}

const schema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  frequency: z.enum(["weekly", "monthly", "custom"]).optional(),
  deadline: z.string().optional(), // ISO date string
  icon: z.string().optional(),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const body = schema.parse(await req.json());
    await createGoal(toFormData(body));
    return apiOk({ message: "Target dibuat" }, 201);
  });
}
