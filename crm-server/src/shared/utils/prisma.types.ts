import { Prisma, PrismaClient } from "../../../generated/prisma/client";

export type PrismaClientTx = PrismaClient | Prisma.TransactionClient;