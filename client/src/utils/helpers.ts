/**
 * Returns the appropriate CSS classes for confidence-based highlighting.
 */
export function getConfidenceStyle(confidence?: number): string {
  if (confidence === undefined) return "";
  if (confidence < 0.4) return "bg-red-100 border-red-300 ring-1 ring-red-200";
  if (confidence < 0.7)
    return "bg-yellow-50 border-yellow-300 ring-1 ring-yellow-200";
  return "";
}

/**
 * Returns a human-readable tooltip for confidence level.
 */
export function getConfidenceTooltip(confidence?: number): string | undefined {
  if (confidence === undefined) return undefined;
  const pct = Math.round(confidence * 100);
  if (confidence < 0.4) return `Low confidence (${pct}%) — likely needs correction`;
  if (confidence < 0.7) return `Medium confidence (${pct}%) — review this field`;
  return `High confidence (${pct}%)`;
}

/**
 * Format a number as currency.
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency?: string | null
): string {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
