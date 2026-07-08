import { z } from "zod";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { updateThemeSettings } from "@/lib/actions";

const schema = z.object({
  theme: z.string().min(1),
  mode: z.enum(["light", "dark"]),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    await requireApiUserId();
    const body = schema.parse(await req.json());
    await updateThemeSettings(body.theme, body.mode);
    return apiOk({ message: "Tema diperbarui" });
  });
}
