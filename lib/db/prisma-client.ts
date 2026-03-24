import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Prisma 7 requires a driver adapter
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  // Resolve relative paths from project root
  const normalizedUrl = dbUrl.startsWith("file:./")
    ? `file:${path.join(process.cwd(), dbUrl.replace("file:./", ""))}`
    : dbUrl;

  const adapter = new PrismaBetterSqlite3({ url: normalizedUrl });

  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
