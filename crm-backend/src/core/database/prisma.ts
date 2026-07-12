import { PrismaClient } from '@prisma/client';

// Single Prisma client instance, reused across the app (avoids exhausting
// the DB connection pool by creating a new client per request).
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
