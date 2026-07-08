import { auth, signOut } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import PageHeader from "@/components/page-header";
import ThemePicker from "./theme-picker";
import Link from "next/link";
import { FileDown, LogOut } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  const userId = (session?.user as any).id as string;
  const [me] = await db.select().from(users).where(eq(users.id, userId));

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
      <PageHeader title="Pengaturan" subtitle={`Masuk sebagai ${me?.name}`} />

      <ThemePicker currentTheme={me?.theme ?? "sakura-pink"} currentMode={me?.mode ?? "light"} />

      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>EXPORT DATA</p>
        <div className="flex gap-2">
          <Link href="/api/export?format=csv" className="mf-card px-4 py-2.5 text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
            <FileDown size={16} /> CSV
          </Link>
          <Link href="/api/export?format=xlsx" className="mf-card px-4 py-2.5 text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
            <FileDown size={16} /> Excel
          </Link>
          <Link href="/api/export?format=pdf" className="mf-card px-4 py-2.5 text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
            <FileDown size={16} /> PDF
          </Link>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>LAINNYA</p>
        <Link href="/categories" className="mf-card p-4 flex items-center justify-between text-sm font-semibold" style={{ color: "var(--text)" }}>
          Kelola Kategori →
        </Link>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="w-full mf-card p-4 flex items-center justify-center gap-2 text-sm font-semibold"
          style={{ color: "var(--expense)" }}
        >
          <LogOut size={16} /> Keluar Akun
        </button>
      </form>
    </div>
  );
}
