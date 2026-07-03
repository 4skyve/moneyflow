"use client";

import { useTransition } from "react";
import { updateThemeSettings } from "@/lib/actions";
import { useRouter } from "next/navigation";

const THEMES = [
  { key: "sakura-pink", label: "Sakura Pink", emoji: "🌸", color: "#F2879E" },
  { key: "baby-blue", label: "Baby Blue", emoji: "🩵", color: "#6FA3E0" },
  { key: "lavender", label: "Lavender", emoji: "💜", color: "#A78BE0" },
  { key: "peach", label: "Peach", emoji: "🍑", color: "#F0A363" },
  { key: "matcha", label: "Matcha", emoji: "🍵", color: "#7FAE7E" },
  { key: "beige", label: "Beige", emoji: "🧸", color: "#B79A72" },
  { key: "midnight", label: "Midnight", emoji: "🌙", color: "#8C93E8" },
];

export default function ThemePicker({ currentTheme, currentMode }: { currentTheme: string; currentMode: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function apply(theme: string, mode: string) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-mode", mode);
    startTransition(async () => {
      await updateThemeSettings(theme, mode);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>MODE</p>
        <div className="flex gap-2">
          <button onClick={() => apply(currentTheme, "light")} className="flex-1 rounded-xl py-2.5 text-sm font-semibold border" style={{ background: currentMode === "light" ? "var(--accent)" : "var(--card-bg)", color: currentMode === "light" ? "#fff" : "var(--text)", borderColor: "var(--border)" }}>
            ☀️ Light
          </button>
          <button onClick={() => apply(currentTheme, "dark")} className="flex-1 rounded-xl py-2.5 text-sm font-semibold border" style={{ background: currentMode === "dark" ? "var(--accent)" : "var(--card-bg)", color: currentMode === "dark" ? "#fff" : "var(--text)", borderColor: "var(--border)" }}>
            🌙 Dark
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>TEMA WARNA</p>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => apply(t.key, currentMode)}
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl p-3 border text-sm font-medium"
              style={{
                borderColor: currentTheme === t.key ? t.color : "var(--border)",
                borderWidth: currentTheme === t.key ? 2 : 1,
                background: "var(--card-bg)",
                color: "var(--text)",
              }}
            >
              <span className="w-4 h-4 rounded-full" style={{ background: t.color }} />
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
