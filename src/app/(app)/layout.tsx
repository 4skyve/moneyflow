import { auth, signOut } from "@/lib/auth";
import { SidebarNav, BottomNav } from "@/components/nav";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen w-full">
      <aside
        className="hidden md:flex w-64 shrink-0 flex-col border-r p-5 gap-6 sticky top-0 h-screen"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 px-2">
          <span className="text-2xl">🌸</span>
          <span className="font-display text-lg font-semibold" style={{ color: "var(--text)" }}>
            MoneyFlow
          </span>
        </div>
        <SidebarNav />
        <div className="mt-auto">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium w-full"
              style={{ color: "var(--text-muted)" }}
            >
              <LogOut size={18} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0 pb-24 md:pb-8">{children}</main>
      <BottomNav />
    </div>
  );
}
