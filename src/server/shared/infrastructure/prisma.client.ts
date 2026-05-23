import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = global.prismaClient ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.prismaClient = prisma;
}
