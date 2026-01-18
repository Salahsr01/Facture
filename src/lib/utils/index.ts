export { cn } from "./cn";

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number | string,
  currency: string = "EUR",
  locale: string = "fr-FR"
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(numAmount);
}

/**
 * Format date
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  locale: string = "fr-FR"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(
  prefix: string = "F",
  number: number
): string {
  return `${prefix}${number.toString().padStart(4, "0")}`;
}

/**
 * Validate SIRET (14 digits)
 */
export function isValidSiret(siret: string): boolean {
  const cleanSiret = siret.replace(/\s/g, "");
  if (!/^\d{14}$/.test(cleanSiret)) return false;

  // Luhn algorithm check
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(cleanSiret[i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/**
 * Validate SIREN (9 digits)
 */
export function isValidSiren(siren: string): boolean {
  const cleanSiren = siren.replace(/\s/g, "");
  if (!/^\d{9}$/.test(cleanSiren)) return false;

  // Luhn algorithm check
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(cleanSiren[i], 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/**
 * Validate IBAN (basic format check)
 */
export function isValidIban(iban: string): boolean {
  const cleanIban = iban.replace(/\s/g, "").toUpperCase();
  // Basic format: 2 letters + 2 digits + up to 30 alphanumeric
  return /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(cleanIban);
}

/**
 * Format IBAN with spaces
 */
export function formatIban(iban: string): string {
  const cleanIban = iban.replace(/\s/g, "").toUpperCase();
  return cleanIban.match(/.{1,4}/g)?.join(" ") || cleanIban;
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(
  items: Array<{ quantity: number | string; unitPrice: number | string }>,
  taxRate: number | string = 20
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = items.reduce((sum, item) => {
    const qty = typeof item.quantity === "string" ? parseFloat(item.quantity) : item.quantity;
    const price = typeof item.unitPrice === "string" ? parseFloat(item.unitPrice) : item.unitPrice;
    return sum + qty * price;
  }, 0);

  const rate = typeof taxRate === "string" ? parseFloat(taxRate) : taxRate;
  const taxAmount = subtotal * (rate / 100);
  const total = subtotal + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Generate secure random token
 */
export function generateToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length];
  }
  return token;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    draft: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
    sent: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
    paid: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
    overdue: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
    partially_paid: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
    disputed: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
    cancelled: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-300" },
  };
  return colors[status] || colors.draft;
}

/**
 * Get status label in French
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Brouillon",
    sent: "Envoyée",
    paid: "Payée",
    overdue: "En retard",
    partially_paid: "Partiellement payée",
    disputed: "Litige",
    cancelled: "Annulée",
  };
  return labels[status] || status;
}
