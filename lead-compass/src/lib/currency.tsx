import React from "react";

export interface CurrencyFormatOptions {
  compact?: boolean;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  showZeroAsDash?: boolean;
}

/**
 * Formats a number to Indian Rupee (INR / ₹) standard currency format.
 * Examples:
 *   formatCurrency(150000) => "₹1,50,000"
 *   formatCurrency(15000000, { compact: true }) => "₹1.5 Cr"
 *   formatCurrency(250000, { compact: true }) => "₹2.5 L"
 */
export function formatINR(
  amount?: number | string | null,
  options: CurrencyFormatOptions = {},
): string {
  if (amount == null || amount === "") {
    return options.showZeroAsDash ? "—" : "₹0";
  }

  const num = typeof amount === "string" ? Number(amount) : amount;
  if (isNaN(num)) {
    return options.showZeroAsDash ? "—" : "₹0";
  }

  if (num === 0 && options.showZeroAsDash) {
    return "—";
  }

  if (options.compact) {
    const abs = Math.abs(num);
    const sign = num < 0 ? "-" : "";
    if (abs >= 10000000) {
      // Crores
      return `${sign}₹${(abs / 10000000).toFixed(options.maximumFractionDigits ?? 1)} Cr`;
    }
    if (abs >= 100000) {
      // Lakhs
      return `${sign}₹${(abs / 100000).toFixed(options.maximumFractionDigits ?? 1)} L`;
    }
    if (abs >= 1000) {
      // Thousands
      return `${sign}₹${(abs / 1000).toFixed(options.maximumFractionDigits ?? 1)} K`;
    }
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
  }).format(num);
}

// Alias for universal usage
export const formatCurrency = formatINR;

/**
 * Reusable Currency component to display amounts formatted in INR across the UI
 */
export function Currency({
  value,
  compact = false,
  maximumFractionDigits,
  minimumFractionDigits,
  showZeroAsDash = false,
  className = "",
}: {
  value?: number | string | null;
  compact?: boolean;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  showZeroAsDash?: boolean;
  className?: string;
}) {
  const formatted = formatINR(value, {
    compact,
    maximumFractionDigits,
    minimumFractionDigits,
    showZeroAsDash,
  });

  return <span className={className}>{formatted}</span>;
}

export default Currency;

