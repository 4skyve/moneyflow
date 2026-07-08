import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { listNotes } from "@/lib/queries";
import { createNote } from "@/lib/actions";
import { toFormData } from "@/lib/form-data";

export async function GET() {
  return withApiErrorHandling(async () => {
    const userId = await requireApiUserId();
    const notes = await listNotes(userId);
    return apiOk({ notes });
  });
}

const schema = z.object({ content: z.string().min(1) });

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const body = schema.parse(await req.json());
    await createNote(toFormData(body));
    return apiOk({ message: "Catatan disimpan" }, 201);
  });
}
