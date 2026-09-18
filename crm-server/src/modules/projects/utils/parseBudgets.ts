import { Prisma } from "../../../../generated/prisma/client";

export function parseBudgetToDecimal(budget: string | number | null | undefined): Prisma.Decimal | null {
  if (budget === null || budget === undefined) return null;

  if (typeof budget === "number") {
    if (Number.isNaN(budget) || budget <= 0) return null;
    return new Prisma.Decimal(budget);
  }

  const str = String(budget).trim();
  if (!str) return null;

  // Handle 'k' / 'm' suffix if present (e.g. 50k -> 50000)
  let multiplier = 1;
  const lowerStr = str.toLowerCase();
  if (lowerStr.endsWith("k") || lowerStr.includes("k ")) {
    multiplier = 1000;
  } else if (lowerStr.endsWith("m") || lowerStr.includes("m ")) {
    multiplier = 1000000;
  }

  // Handle range by taking first number (e.g., "$10,000 - $20,000" -> "$10,000")
  const firstPart = str.split("-")[0] || str;

  const cleaned = firstPart.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;

  const value = Number(cleaned) * multiplier;
  if (Number.isNaN(value) || value <= 0) return null;

  return new Prisma.Decimal(value);
}