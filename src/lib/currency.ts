export const DEFAULT_CURRENCY = "AUD";

export const CURRENCIES = [
  { code: "AUD", label: "Australian dollar (AUD)" },
  { code: "NZD", label: "New Zealand dollar (NZD)" },
  { code: "USD", label: "US dollar (USD)" },
  { code: "GBP", label: "British pound (GBP)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "CAD", label: "Canadian dollar (CAD)" },
  { code: "SGD", label: "Singapore dollar (SGD)" },
  { code: "HKD", label: "Hong Kong dollar (HKD)" },
  { code: "JPY", label: "Japanese yen (JPY)" },
] as const;

const VALID_CODES = new Set<string>(CURRENCIES.map((c) => c.code));

export function normalizeCurrency(code: unknown): string {
  const upper = typeof code === "string" ? code.trim().toUpperCase() : "";
  return VALID_CODES.has(upper) ? upper : DEFAULT_CURRENCY;
}

export function currencyLabel(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.label ?? code;
}
