import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __mfPool: mysql.Pool | undefined;
}

const pool =
  global.__mfPool ??
  mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 5,
    ssl: {
      // Aiven wajib pakai SSL. rejectUnauthorized: false artinya
      // koneksi tetap terenkripsi tapi tidak verifikasi cert server
      // (setara dengan --ssl-mode=REQUIRED yang kamu pakai pas restore).
      rejectUnauthorized: false,
    },
  });

if (process.env.NODE_ENV !== "production") global.__mfPool = pool;

export const db = drizzle(pool, { schema, mode: "default" });