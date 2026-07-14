import { PrismaClient } from '@prisma/client'

// Prevent multiple PrismaClient instances in development due to hot-reloading.
// In production a single instance is created and reused.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
