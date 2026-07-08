import "server-only";
import { db } from "@/db";
import { users, wallets, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

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

export class CredentialError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/** Dipakai oleh: NextAuth authorize() (web) dan /api/v1/auth/login (mobile) */
export async function verifyUserCredentials(email: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return user;
}

/** Dipakai oleh: /api/register (web) dan /api/v1/auth/register (mobile) */
export async function createUserAccount(name: string, email: string, password: string) {
  const lowerEmail = email.toLowerCase();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, lowerEmail))
    .limit(1);

  if (existing) {
    throw new CredentialError("Email sudah terdaftar", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();

  await db.insert(users).values({ id: userId, name, email: lowerEmail, passwordHash });

  await db.insert(wallets).values({
    userId,
    name: "Cash",
    icon: "wallet",
    color: "#F5A9B8",
    startingBalance: "0",
  });

  await db.insert(categories).values([
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({ userId, type: "expense" as const, ...c })),
    ...DEFAULT_INCOME_CATEGORIES.map((c) => ({ userId, type: "income" as const, ...c })),
  ]);

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user;
}
