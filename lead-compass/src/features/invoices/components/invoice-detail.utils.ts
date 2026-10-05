import { formatCurrency } from "@/lib/currency";

export function formatInvoiceAmount(amount: number, _currency?: string) {
  return formatCurrency(amount, { maximumFractionDigits: 2 });
}
