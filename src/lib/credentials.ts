import "server-only";
import { db } from "@/db";
import { users, wallets, categories, passwordResetCodes } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/email";

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

const RESET_CODE_TTL_MINUTES = 15;

function generateResetCode() {
  // 6-digit numeric OTP, zero-padded (e.g. "042817").
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Dipakai oleh: web /forgot-password dan mobile /api/v1/auth/forgot-password.
 * Sengaja TIDAK melempar error kalau email tidak ditemukan (mencegah orang
 * memakai form ini untuk mengecek email siapa saja yang terdaftar) — pemanggil
 * selalu menampilkan pesan yang sama ("kalau email terdaftar, kode terkirim").
 */
export async function requestPasswordReset(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) return; // silently no-op — lihat catatan di atas

  const code = generateResetCode();
  const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);

  await db.insert(passwordResetCodes).values({ userId: user.id, code, expiresAt });
  await sendPasswordResetEmail(user.email, code);
}

/** Dipakai oleh: web /reset-password dan mobile /api/v1/auth/reset-password. */
export async function resetPasswordWithCode(email: string, code: string, newPassword: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) throw new CredentialError("Kode tidak valid atau sudah kedaluwarsa", 400);

  const [resetCode] = await db
    .select()
    .from(passwordResetCodes)
    .where(
      and(
        eq(passwordResetCodes.userId, user.id),
        eq(passwordResetCodes.code, code),
        eq(passwordResetCodes.used, false),
        gt(passwordResetCodes.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!resetCode) throw new CredentialError("Kode tidak valid atau sudah kedaluwarsa", 400);

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));
  await db.update(passwordResetCodes).set({ used: true }).where(eq(passwordResetCodes.id, resetCode.id));
}
