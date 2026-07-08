import { z } from "zod";
import { verifyUserCredentials } from "@/lib/credentials";
import { signAccessToken } from "@/lib/jwt";
import { apiOk, apiError, withApiErrorHandling } from "@/lib/api-response";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError("Email atau password tidak valid", 422, parsed.error.issues);

    const user = await verifyUserCredentials(parsed.data.email, parsed.data.password);
    if (!user) return apiError("Email atau password salah", 401);

    const token = await signAccessToken(user.id, user.email);
    return apiOk({
      token,
      user: { id: user.id, name: user.name, email: user.email, theme: user.theme, mode: user.mode },
    });
  });
}
