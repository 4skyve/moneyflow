import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "mysql://root:VAKdCIJPnneXtIMRaDcxTRNaSVDFTRtC@hayabusa.proxy.rlwy.net:39999/railway",
  },
});
