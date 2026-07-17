"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;

    const res = await fetch("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      toast.error(json.error?.message ?? "Gagal mengirim kode");
      return;
    }

    toast.success("Kalau email kamu terdaftar, kode sudah dikirim. Cek inbox/spam ya.");
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--page-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔑</div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--text)" }}>
            Lupa password?
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Masukkan email akunmu, kami kirim kode reset ke sana.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mf-card p-6 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="kamu@email.com"
              className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
              style={{ background: "var(--card-bg-soft)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full mf-accent-bg rounded-xl py-3 font-semibold text-sm disabled:opacity-60 transition"
          >
            {loading ? "Mengirim..." : "Kirim Kode Reset"}
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: "var(--text-muted)" }}>
          Ingat password lagi?{" "}
          <Link href="/login" className="mf-accent-text font-semibold">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
