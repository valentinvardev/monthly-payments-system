// Prisma config — Prisma 7+
// DATABASE_URL = pooled (pgbouncer, port 6543) for the app at runtime
// DIRECT_URL   = session/direct (port 5432) for migrations
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
