import { z } from "zod";
import { createUserAccount, CredentialError } from "@/lib/credentials";
import { signAccessToken } from "@/lib/jwt";
import { apiOk, apiError, withApiErrorHandling } from "@/lib/api-response";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Data tidak valid", 422, parsed.error.issues);

    try {
      const user = await createUserAccount(parsed.data.name, parsed.data.email, parsed.data.password);
      const token = await signAccessToken(user.id, user.email);
      return apiOk(
        { token, user: { id: user.id, name: user.name, email: user.email, theme: user.theme, mode: user.mode } },
        201
      );
    } catch (e) {
      if (e instanceof CredentialError) return apiError(e.message, e.status);
      throw e;
    }
  });
}
