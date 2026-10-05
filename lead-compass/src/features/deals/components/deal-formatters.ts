import { formatCurrency } from "@/lib/currency";

export const formatDealAmount = formatCurrency;

export function formatDealDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
