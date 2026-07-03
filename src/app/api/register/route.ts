import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, wallets, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Makan", icon: "utensils", color: "#F5A9B8" },
  { name: "Transport", icon: "car", color: "#A9C6F5" },
  { name: "Belanja", icon: "shopping-bag", color: "#C9A9F5" },
  { name: "Hiburan", icon: "popcorn", color: "#F5D6A9" },
  { name: "Pendidikan", icon: "book-open", color: "#A9F5D6" },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Uang Saku", icon: "hand-coins", color: "#B8E0D2" },
  { name: "Gaji", icon: "briefcase", color: "#B8E0D2" },
  { name: "Bonus", icon: "gift", color: "#B8E0D2" },
  { name: "Freelance", icon: "laptop", color: "#B8E0D2" },
];

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }
  const { name, email, password } = parsed.data;
  const lowerEmail = email.toLowerCase();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, lowerEmail))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "Email sudah terdaftar" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();

  await db.insert(users).values({
    id: userId,
    name,
    email: lowerEmail,
    passwordHash,
  });

  // Seed default wallet "Cash" agar user langsung bisa Quick Capture
  await db.insert(wallets).values({
    userId,
    name: "Cash",
    icon: "wallet",
    color: "#F5A9B8",
    startingBalance: "0",
  });

  await db.insert(categories).values([
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
      userId,
      type: "expense" as const,
      ...c,
    })),
    ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
      userId,
      type: "income" as const,
      ...c,
    })),
  ]);

  return NextResponse.json({ ok: true });
}
