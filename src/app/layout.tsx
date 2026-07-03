import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "./providers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "MoneyFlow — Catat Keuangan Secepat Ketikan",
  description: "Planner keuangan pribadi yang estetik dan menyenangkan.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let theme = "sakura-pink";
  let mode = "light";

  const userId = (session?.user as any)?.id as string | undefined;
  if (userId) {
    const [u] = await db.select({ theme: users.theme, mode: users.mode }).from(users).where(eq(users.id, userId));
    if (u) {
      theme = u.theme;
      mode = u.mode;
    }
  }

  return (
    <html lang="id" data-theme={theme} data-mode={mode} className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: "var(--page-bg)" }}>
        <Providers>{children}</Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
