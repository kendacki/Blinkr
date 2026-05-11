import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
  // Fail loudly instead of letting Prisma silently fall back to localhost:5432
  // on the deployed serverless runtime (e.g. Vercel).
  console.error(
    "[Blinkr] DATABASE_URL is not set in the production environment. " +
      "Configure it in your hosting provider (Vercel → Settings → Environment Variables)."
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
