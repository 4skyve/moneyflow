import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { toggleRecurring } from "@/lib/actions";

const schema = z.object({ active: z.boolean() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const { id } = await params;
    const body = schema.parse(await req.json());
    await toggleRecurring(id, body.active);
    return apiOk({ message: "Diperbarui" });
  });
}
