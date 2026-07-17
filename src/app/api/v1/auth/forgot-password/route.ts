import { z } from "zod";
import { requestPasswordReset } from "@/lib/credentials";
import { apiOk, apiError, withApiErrorHandling } from "@/lib/api-response";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError("Email tidak valid", 422, parsed.error.issues);

    try {
      await requestPasswordReset(parsed.data.email);
    } catch (e) {
      // Email service belum dikonfigurasi, dsb — beri tahu apa adanya.
      // (Bedakan dari kasus "email tidak ditemukan", yang sengaja tidak dibocorkan.)
      if (e instanceof Error && e.message.includes("email belum dikonfigurasi")) {
        return apiError(e.message, 503);
      }
      throw e;
    }

    // Selalu balas sukses generik, terlepas email terdaftar atau tidak.
    return apiOk({ message: "Kalau email terdaftar, kode reset sudah dikirim." });
  });
}
