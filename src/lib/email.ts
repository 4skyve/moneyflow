import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Resend's shared testing domain — works without verifying your own domain,
// but can only send to the email address you signed up to Resend with.
// For production (sending to any real user), verify your own domain in
// the Resend dashboard and set RESEND_FROM_EMAIL to an address on it.
const FROM = process.env.RESEND_FROM_EMAIL || "MoneyFlow <onboarding@resend.dev>";

export async function sendPasswordResetEmail(to: string, code: string) {
  if (!resend) {
    // Fail loudly in logs instead of silently pretending the email was sent.
    console.error(
      "[MoneyFlow] RESEND_API_KEY belum di-set — email reset password TIDAK terkirim. Lihat .env.example."
    );
    throw new Error("Layanan email belum dikonfigurasi. Hubungi admin.");
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `${code} — Kode Reset Password MoneyFlow`,
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; padding: 24px;">
        <p style="font-size: 28px; margin: 0 0 8px;">🌸</p>
        <h2 style="margin: 0 0 12px; color: #2B2320;">Reset password MoneyFlow</h2>
        <p style="color: #5A5048; font-size: 14px; line-height: 1.6;">
          Kami menerima permintaan reset password untuk akun ini. Masukkan kode berikut di aplikasi:
        </p>
        <div style="background: #FCE4EA; border-radius: 16px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #D9607A;">${code}</span>
        </div>
        <p style="color: #8A7E78; font-size: 13px; line-height: 1.6;">
          Kode ini berlaku selama 15 menit. Kalau kamu tidak meminta reset password, abaikan saja email ini —
          password akunmu tetap aman.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[MoneyFlow] Resend error:", error);
    throw new Error("Gagal mengirim email. Coba lagi beberapa saat.");
  }
}
