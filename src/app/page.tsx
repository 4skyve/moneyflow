import Link from "next/link";
import {
  Zap,
  Wallet,
  PiggyBank,
  BarChart3,
  Palette,
  Lock,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "MoneyFlow — Catat keuangan secepat kamu ngetik",
  description:
    "Ganti spreadsheet manualmu. Ketik \"beli makan 25rb pakai DANA\", sisanya dihitung otomatis.",
};

const THEME_DOTS = [
  { name: "Sakura Pink", color: "#F2879E" },
  { name: "Baby Blue", color: "#6FA3E0" },
  { name: "Lavender", color: "#A78BE0" },
  { name: "Peach", color: "#F0A363" },
  { name: "Matcha", color: "#7FAE7E" },
  { name: "Beige", color: "#B79A72" },
  { name: "Midnight", color: "#8C93E8" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Quick Capture",
    desc: "Catat pemasukan dan pengeluaran dalam hitungan detik. Cukup isi judul, nominal, kategori, dan dompet, lalu saldo akan diperbarui secara otomatis.",
  },
  {
    icon: Wallet,
    title: "Dompet & Transfer",
    desc: "Kelola berbagai dompet seperti tunai, e-wallet, maupun rekening bank. Transfer antar dompet tercatat dengan rapi tanpa memengaruhi total pemasukan atau pengeluaran.",
  },
  {
    icon: PiggyBank,
    title: "Manajemen Tabungan",
    desc: "Pantau aktivitas tabungan dengan lebih jelas. Pengambilan dana dapat dicatat sebagai pinjaman sementara hingga dikembalikan.",
  },
  {
    icon: BarChart3,
    title: "Statistik Keuangan",
    desc: "Analisis kondisi keuangan melalui laporan harian, mingguan, bulanan, hingga tahunan lengkap dengan kategori pengeluaran dan tren transaksi.",
  },
  {
    icon: Palette,
    title: "Kustomisasi Tampilan",
    desc: "Pilih dari berbagai tema warna serta dukungan mode terang dan gelap untuk pengalaman penggunaan yang lebih nyaman.",
  },
  {
    icon: Lock,
    title: "Keamanan Data",
    desc: "Mendukung penggunaan multi-akun dengan pemisahan data yang aman, sehingga setiap pengguna memiliki riwayat transaksi yang terkelola secara terpisah.",
  },
];

export default function LandingPage() {
  return (
    <main style={{ background: "var(--page-bg)" }}>
      {/* NAV */}
      <header className="max-w-6xl mx-auto px-5 md:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="font-display text-lg font-semibold" style={{ color: "var(--text)" }}>
            MoneyFlow
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-semibold px-4 py-2 rounded-full"
            style={{ color: "var(--text)" }}
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold px-4 py-2 rounded-full mf-accent-bg"
          >
            Daftar
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
            style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}
          >
            ✨ Planner keuangan, bukan software akuntansi
          </div>
          <h1
            className="font-display text-4xl md:text-5xl font-semibold leading-tight"
            style={{ color: "var(--text)" }}
          >
            Manajemen keuangan{" "}
            <span className="mf-accent-text">Catat transaksi </span>dalam hitungan detik.
          </h1>
          <p className="mt-5 text-base md:text-lg" style={{ color: "var(--text-muted)" }}>
            Tidak perlu spreadsheet atau menghitung saldo secara manual. 
            Cukup catat transaksi, pilih dompet, dan MoneyFlow akan memperbarui saldo secara otomatis.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3.5 rounded-full mf-accent-bg"
            >
              Mulai Gratis <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold px-6 py-3.5"
              style={{ color: "var(--text)" }}
            >
              Sudah punya akun? Masuk
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-2">
            {THEME_DOTS.map((t) => (
              <span
                key={t.name}
                title={t.name}
                className="w-5 h-5 rounded-full border-2"
                style={{ background: t.color, borderColor: "var(--card-bg)" }}
              />
            ))}
            <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
              7 tema untuk dipilih
            </span>
          </div>
        </div>

        {/* SIGNATURE: recreated Quick Capture card with a CSS-only typing reveal */}
        <div className="relative">
          <div
            className="absolute -inset-6 rounded-[2rem] opacity-60 blur-2xl -z-10"
            style={{ background: "var(--accent-soft)" }}
          />
          <div className="mf-card p-6 mx-auto max-w-sm rotate-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold" style={{ color: "var(--text)" }}>
                📝 Lagi keluar uang untuk apa?
              </h2>
              <div className="flex rounded-full p-1 text-xs font-semibold" style={{ background: "var(--card-bg-soft)" }}>
                <span className="px-3 py-1 rounded-full text-white" style={{ background: "var(--expense)" }}>
                  Keluar
                </span>
                <span className="px-3 py-1 rounded-full" style={{ color: "var(--text-muted)" }}>
                  Masuk
                </span>
              </div>
            </div>

            <div
              className="w-full rounded-xl px-4 py-3 text-sm font-medium border overflow-hidden whitespace-nowrap"
              style={{ background: "var(--card-bg-soft)", borderColor: "var(--border)", color: "var(--text)" }}
            >
              <span className="mf-typing-text">Beli makan pakai DANA</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div
                className="rounded-xl px-4 py-3 text-sm border"
                style={{ background: "var(--card-bg-soft)", borderColor: "var(--border)", color: "var(--text)" }}
              >
                Rp25.000
              </div>
              <div
                className="rounded-xl px-4 py-3 text-sm border"
                style={{ background: "var(--card-bg-soft)", borderColor: "var(--border)", color: "var(--text)" }}
              >
                DANA
              </div>
            </div>

            <div className="w-full rounded-xl py-3 mt-3 text-center text-sm font-semibold mf-accent-bg">
              Simpan
            </div>

            <p className="text-center text-[11px] mt-3" style={{ color: "var(--text-muted)" }}>
              ⏱️ Tercatat dalam &lt; 5 detik
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-semibold" style={{ color: "var(--text)" }}>
            Semua yang dibutuhkan! tidak lebih, tidak kurang
          </h2>
          <p className="mt-3 text-sm md:text-base" style={{ color: "var(--text-muted)" }}>
            Sistem hanya membantu menghitung dan mengingatkan — keputusan tetap di tanganmu.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="mf-card p-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "var(--accent-soft)" }}
                >
                  <Icon size={18} className="mf-accent-text" />
                </div>
                <h3 className="font-display text-base font-semibold mb-1.5" style={{ color: "var(--text)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-20">
        <div className="mf-card p-10 md:p-14 text-center mf-accent-bg" style={{ background: "var(--accent)" }}>
          <h2 className="font-display text-2xl md:text-3xl font-semibold">
            Mulai catat hari ini, gratis.
          </h2>
          <p className="mt-2 text-sm opacity-90">
            Tidak perlu kartu kredit. hanya butuh niat catat dan konsistensi.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3.5 rounded-full mt-6"
            style={{ background: "var(--card-bg)", color: "var(--accent-strong)" }}
          >
            Buat Akun Gratis <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-5 md:px-8 py-8 flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
        <span>🌸 MoneyFlow</span>
        <span>Planner keuangan pribadi yang aesthetic dan menyenangkan.</span>
      </footer>
    </main>
  );
}
