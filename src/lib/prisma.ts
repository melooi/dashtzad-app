import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  // bump this version string after every `prisma generate` to force a fresh client
  prismaSchemaVersion?: string;
};

const SCHEMA_VERSION = "2026-06-27-v2";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Force a new client if the schema was regenerated (dev gotcha: stale globalThis client)
if (process.env.NODE_ENV !== "production" && globalForPrisma.prismaSchemaVersion !== SCHEMA_VERSION) {
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaSchemaVersion = SCHEMA_VERSION;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
