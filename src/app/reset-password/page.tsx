"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = fd.get("newPassword") as string;
    const confirm = fd.get("confirmPassword") as string;

    if (password !== confirm) {
      toast.error("Konfirmasi password tidak sama");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        email: fd.get("email"),
        code: fd.get("code"),
        newPassword: password,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      toast.error(json.error?.message ?? "Gagal reset password");
      return;
    }

    toast.success("Password berhasil diubah. Silakan masuk.");
    router.push("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--page-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">✉️</div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--text)" }}>
            Masukkan kode
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Cek email kamu, kode berlaku 15 menit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mf-card p-6 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={searchParams.get("email") ?? ""}
              placeholder="kamu@email.com"
              className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
              style={{ background: "var(--card-bg-soft)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Kode (6 digit)</span>
            <input
              name="code"
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              placeholder="123456"
              className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm outline-none border tracking-[0.3em] text-center font-semibold"
              style={{ background: "var(--card-bg-soft)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Password Baru</span>
            <input
              name="newPassword"
              type="password"
              required
              placeholder="Minimal 6 karakter"
              className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
              style={{ background: "var(--card-bg-soft)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Konfirmasi Password Baru</span>
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder="Ulangi password baru"
              className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
              style={{ background: "var(--card-bg-soft)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full mf-accent-bg rounded-xl py-3 font-semibold text-sm disabled:opacity-60 transition"
          >
            {loading ? "Menyimpan..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: "var(--text-muted)" }}>
          Belum dapat kode?{" "}
          <Link href="/forgot-password" className="mf-accent-text font-semibold">
            Kirim ulang
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
