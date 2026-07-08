import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { listWallets } from "@/lib/queries";
import { createWallet } from "@/lib/actions";
import { toFormData } from "@/lib/form-data";

export async function GET() {
  return withApiErrorHandling(async () => {
    const userId = await requireApiUserId();
    const wallets = await listWallets(userId);
    return apiOk({ wallets });
  });
}

const createSchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
  startingBalance: z.number().optional(),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    await requireApiUserId(); // ensures 401 before touching the action
    const body = createSchema.parse(await req.json());
    await createWallet(toFormData(body));
    return apiOk({ message: "Dompet dibuat" }, 201);
  });
}
