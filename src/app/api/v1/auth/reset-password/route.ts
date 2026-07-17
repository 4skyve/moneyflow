import { z } from "zod";
import { resetPasswordWithCode, CredentialError } from "@/lib/credentials";
import { apiOk, apiError, withApiErrorHandling } from "@/lib/api-response";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Data tidak valid", 422, parsed.error.issues);

    try {
      await resetPasswordWithCode(parsed.data.email, parsed.data.code, parsed.data.newPassword);
    } catch (e) {
      if (e instanceof CredentialError) return apiError(e.message, e.status);
      throw e;
    }

    return apiOk({ message: "Password berhasil diubah" });
  });
}
