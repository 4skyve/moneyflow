"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PiggyBank,
  Target,
  BarChart3,
  Settings,
  Gift,
  Repeat,
  Tag,
  Menu,
  X,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: Receipt },
  { href: "/wallets", label: "Dompet", icon: Wallet },
  { href: "/savings", label: "Tabungan", icon: PiggyBank },
  { href: "/goals", label: "Target", icon: Target },
  { href: "/stats", label: "Statistik", icon: BarChart3 },
  { href: "/wishlist", label: "Wishlist", icon: Gift },
  { href: "/recurring", label: "Rutin", icon: Repeat },
  { href: "/categories", label: "Kategori", icon: Tag },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

// 4 item paling sering dipakai tampil langsung di bottom nav mobile.
// Sisanya ada di balik tombol "Lainnya".
const PRIMARY_MOBILE = ["/dashboard", "/transactions", "/wallets", "/stats"];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition"
            style={{
              background: active ? "var(--accent-soft)" : "transparent",
              color: active ? "var(--accent-strong)" : "var(--text-muted)",
            }}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryItems = NAV_ITEMS.filter((i) => PRIMARY_MOBILE.includes(i.href));
  const moreItems = NAV_ITEMS.filter((i) => !PRIMARY_MOBILE.includes(i.href));
  const isMoreActive = moreItems.some((i) => i.href === pathname);

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden flex items-end"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={() => setMoreOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl p-5 pb-8 animate-in slide-in-from-bottom"
            style={{ background: "var(--card-bg)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-display text-base font-semibold" style={{ color: "var(--text)" }}>
                Menu Lainnya
              </p>
              <button onClick={() => setMoreOpen(false)}>
                <X size={20} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col items-center gap-2 rounded-2xl py-4 text-xs font-medium"
                    style={{
                      background: active ? "var(--accent-soft)" : "var(--card-bg-soft)",
                      color: active ? "var(--accent-strong)" : "var(--text)",
                    }}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 md:hidden flex items-center justify-around border-t px-1 py-2 z-40"
        style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
      >
        {primaryItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 px-2 py-1">
              <Icon size={20} color={active ? "var(--accent)" : "var(--text-muted)"} />
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
        <button onClick={() => setMoreOpen(true)} className="flex flex-col items-center gap-0.5 px-2 py-1">
          <Menu size={20} color={isMoreActive ? "var(--accent)" : "var(--text-muted)"} />
          <span
            className="text-[10px] font-medium"
            style={{ color: isMoreActive ? "var(--accent)" : "var(--text-muted)" }}
          >
            Lainnya
          </span>
        </button>
      </nav>
    </>
  );
}
