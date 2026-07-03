"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      email: fd.get("email"),
      password: fd.get("password"),
    };
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Gagal mendaftar");
      setLoading(false);
      return;
    }
    const signInRes = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    setLoading(false);
    if (signInRes?.error) {
      toast.error("Akun dibuat, tapi gagal login otomatis. Silakan login.");
      router.push("/login");
      return;
    }
    toast.success("Selamat datang di MoneyFlow! 🌸");
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--page-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🌸</div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--text)" }}>
            Buat akun MoneyFlow
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Catat keuangan secepat kamu mengetik.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mf-card p-6 space-y-4">
          <Field label="Nama" name="name" type="text" placeholder="Nama kamu" required />
          <Field label="Email" name="email" type="email" placeholder="kamu@email.com" required />
          <Field label="Password" name="password" type="password" placeholder="Minimal 6 karakter" required />

          <button
            type="submit"
            disabled={loading}
            className="w-full mf-accent-bg rounded-xl py-3 font-semibold text-sm disabled:opacity-60 transition"
          >
            {loading ? "Membuat akun..." : "Daftar"}
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: "var(--text-muted)" }}>
          Sudah punya akun?{" "}
          <Link href="/login" className="mf-accent-text font-semibold">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm outline-none border focus:ring-2"
        style={{
          background: "var(--card-bg-soft)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }}
      />
    </label>
  );
}
