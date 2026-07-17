import {
  mysqlTable,
  varchar,
  int,
  bigint,
  decimal,
  boolean,
  timestamp,
  date,
  text,
  mysqlEnum,
  primaryKey,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

const id = () =>
  varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

// ---------- USERS & AUTH ----------
export const users = mysqlTable("users", {
  id: id(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  theme: varchar("theme", { length: 30 }).default("sakura-pink").notNull(),
  mode: mysqlEnum("mode", ["light", "dark"]).default("light").notNull(),
  currency: varchar("currency", { length: 10 }).default("IDR").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- PASSWORD RESET (OTP by email) ----------
export const passwordResetCodes = mysqlTable(
  "password_reset_codes",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    code: varchar("code", { length: 6 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    used: boolean("used").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ userIdx: index("reset_codes_user_idx").on(t.userId) })
);

// ---------- WALLETS ----------
export const wallets = mysqlTable(
  "wallets",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 20 }).default("wallet").notNull(),
    color: varchar("color", { length: 20 }).default("#F5A9B8").notNull(),
    startingBalance: decimal("starting_balance", { precision: 14, scale: 2 })
      .default("0")
      .notNull(),
    archived: boolean("archived").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ userIdx: index("wallets_user_idx").on(t.userId) })
);

// ---------- CATEGORIES ----------
export const categories = mysqlTable(
  "categories",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    type: mysqlEnum("type", ["income", "expense"]).notNull(),
    icon: varchar("icon", { length: 20 }).default("tag").notNull(),
    color: varchar("color", { length: 20 }).default("#B8E0D2").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ userIdx: index("categories_user_idx").on(t.userId) })
);

// ---------- TAGS ----------
export const tags = mysqlTable(
  "tags",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 50 }).notNull(),
  },
  (t) => ({ userIdx: index("tags_user_idx").on(t.userId) })
);

// ---------- TRANSACTIONS ----------
export const transactions = mysqlTable(
  "transactions",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    walletId: varchar("wallet_id", { length: 36 }).notNull(),
    categoryId: varchar("category_id", { length: 36 }),
    title: varchar("title", { length: 150 }).notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    type: mysqlEnum("type", ["income", "expense"]).notNull(),
    occurredAt: timestamp("occurred_at").notNull(),
    note: text("note"),
    photoUrl: varchar("photo_url", { length: 500 }),
    tagsCsv: varchar("tags_csv", { length: 255 }).default("").notNull(),
    isDraft: boolean("is_draft").default(false).notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("transactions_user_idx").on(t.userId),
    walletIdx: index("transactions_wallet_idx").on(t.walletId),
    dateIdx: index("transactions_date_idx").on(t.occurredAt),
  })
);

// ---------- WALLET TRANSFERS ----------
export const transfers = mysqlTable(
  "transfers",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    fromWalletId: varchar("from_wallet_id", { length: 36 }).notNull(),
    toWalletId: varchar("to_wallet_id", { length: 36 }).notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    note: text("note"),
    occurredAt: timestamp("occurred_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ userIdx: index("transfers_user_idx").on(t.userId) })
);

// ---------- SAVINGS (Tabungan Tetap) ----------
export const savingsAccounts = mysqlTable(
  "savings_accounts",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 20 }).default("piggy-bank").notNull(),
    startingBalance: decimal("starting_balance", { precision: 14, scale: 2 })
      .default("0")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ userIdx: index("savings_user_idx").on(t.userId) })
);

// Deposits: perpindahan dana masuk ke savings (dari wallet)
export const savingsDeposits = mysqlTable(
  "savings_deposits",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    savingsAccountId: varchar("savings_account_id", { length: 36 }).notNull(),
    walletId: varchar("wallet_id", { length: 36 }).notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    direction: mysqlEnum("direction", ["in", "out"]).default("in").notNull(), // out = pengambilan tanpa jadi pinjaman (jarang)
    note: text("note"),
    occurredAt: timestamp("occurred_at").notNull(),
  },
  (t) => ({ userIdx: index("deposits_user_idx").on(t.userId) })
);

// Rincian tabungan (opsional, manual)
export const savingsDetails = mysqlTable(
  "savings_details",
  {
    id: id(),
    savingsAccountId: varchar("savings_account_id", { length: 36 }).notNull(),
    label: varchar("label", { length: 100 }).notNull(), // e.g. "Bank BCA", "Amplop Biru"
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  },
  (t) => ({ savingsIdx: index("details_savings_idx").on(t.savingsAccountId) })
);

// Pinjaman Tabungan (uang diambil dari savings ke wallet)
export const savingsLoans = mysqlTable(
  "savings_loans",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    savingsAccountId: varchar("savings_account_id", { length: 36 }).notNull(),
    walletId: varchar("wallet_id", { length: 36 }).notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    amountReturned: decimal("amount_returned", { precision: 14, scale: 2 })
      .default("0")
      .notNull(),
    note: text("note"),
    occurredAt: timestamp("occurred_at").notNull(),
  },
  (t) => ({ userIdx: index("loans_user_idx").on(t.userId) })
);

// Pengembalian pinjaman (manual)
export const savingsLoanReturns = mysqlTable("savings_loan_returns", {
  id: id(),
  loanId: varchar("loan_id", { length: 36 }).notNull(),
  walletId: varchar("wallet_id", { length: 36 }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  occurredAt: timestamp("occurred_at").notNull(),
});

// ---------- SAVINGS GOALS (Target Menabung) ----------
export const savingsGoals = mysqlTable(
  "savings_goals",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    targetAmount: decimal("target_amount", { precision: 14, scale: 2 }).notNull(),
    currentAmount: decimal("current_amount", { precision: 14, scale: 2 })
      .default("0")
      .notNull(),
    frequency: mysqlEnum("frequency", ["weekly", "monthly", "custom"])
      .default("monthly")
      .notNull(),
    deadline: date("deadline"),
    icon: varchar("icon", { length: 20 }).default("target").notNull(),
    achieved: boolean("achieved").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ userIdx: index("goals_user_idx").on(t.userId) })
);

export const savingsGoalContributions = mysqlTable("savings_goal_contributions", {
  id: id(),
  goalId: varchar("goal_id", { length: 36 }).notNull(),
  walletId: varchar("wallet_id", { length: 36 }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  occurredAt: timestamp("occurred_at").notNull(),
});

// ---------- RECURRING EXPENSES (Pengeluaran Rutin - reminder only) ----------
export const recurringExpenses = mysqlTable(
  "recurring_expenses",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    dayOfMonth: int("day_of_month").notNull(),
    categoryId: varchar("category_id", { length: 36 }),
    icon: varchar("icon", { length: 20 }).default("repeat").notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ userIdx: index("recurring_user_idx").on(t.userId) })
);

// ---------- WISHLIST ----------
export const wishlistItems = mysqlTable(
  "wishlist_items",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    targetPrice: decimal("target_price", { precision: 14, scale: 2 }).notNull(),
    currentAmount: decimal("current_amount", { precision: 14, scale: 2 })
      .default("0")
      .notNull(),
    status: mysqlEnum("status", ["wishing", "saving", "bought", "cancelled"])
      .default("wishing")
      .notNull(),
    photoUrl: varchar("photo_url", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ userIdx: index("wishlist_user_idx").on(t.userId) })
);

// ---------- FAVORITE TRANSACTIONS (quick templates) ----------
export const favoriteTransactions = mysqlTable(
  "favorite_transactions",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    emoji: varchar("emoji", { length: 10 }).default("⭐").notNull(),
    title: varchar("title", { length: 150 }).notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    categoryId: varchar("category_id", { length: 36 }),
    walletId: varchar("wallet_id", { length: 36 }),
  },
  (t) => ({ userIdx: index("favtx_user_idx").on(t.userId) })
);

// ---------- DAILY NOTES ----------
export const dailyNotes = mysqlTable(
  "daily_notes",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    content: text("content").notNull(),
    occurredAt: timestamp("occurred_at").notNull(),
  },
  (t) => ({ userIdx: index("notes_user_idx").on(t.userId) })
);

// ---------- BALANCE ADJUSTMENTS ----------
export const balanceAdjustments = mysqlTable(
  "balance_adjustments",
  {
    id: id(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    walletId: varchar("wallet_id", { length: 36 }).notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(), // can be negative
    reason: varchar("reason", { length: 255 }),
    occurredAt: timestamp("occurred_at").notNull(),
  },
  (t) => ({ userIdx: index("adjust_user_idx").on(t.userId) })
);

// ---------- RELATIONS ----------
export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  categories: many(categories),
  transactions: many(transactions),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, { fields: [wallets.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, { fields: [transactions.walletId], references: [wallets.id] }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const savingsAccountsRelations = relations(savingsAccounts, ({ many }) => ({
  details: many(savingsDetails),
  loans: many(savingsLoans),
}));
