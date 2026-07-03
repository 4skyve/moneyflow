"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Email atau password salah");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--page-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💸</div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--text)" }}>
            Selamat datang lagi
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Masuk untuk lanjut mencatat keuanganmu.
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
          <label className="block">
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Password</span>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
              style={{ background: "var(--card-bg-soft)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full mf-accent-bg rounded-xl py-3 font-semibold text-sm disabled:opacity-60 transition"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: "var(--text-muted)" }}>
          Belum punya akun?{" "}
          <Link href="/register" className="mf-accent-text font-semibold">
            Daftar
          </Link>
        </p>
      </div>
    </main>
  );
}
