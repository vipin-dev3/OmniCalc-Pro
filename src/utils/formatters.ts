/**
 * Supported financial currencies with symbols and locales
 */
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  popular?: boolean;
}

export const FINANCIAL_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', popular: true },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN', popular: true },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', popular: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB', popular: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', locale: 'en-AE', popular: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', locale: 'en-CA' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', locale: 'de-CH' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN' },
];

/**
 * Format numbers with localized currency symbols and thousand/lakh separators
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  if (isNaN(amount) || !isFinite(amount)) return '$0.00';

  const currencyObj = FINANCIAL_CURRENCIES.find((c) => c.code === currencyCode) || {
    code: currencyCode,
    locale: currencyCode === 'INR' ? 'en-IN' : 'en-US',
  };

  try {
    return new Intl.NumberFormat(currencyObj.locale, {
      style: 'currency',
      currency: currencyObj.code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = currencyObj.code === 'INR' ? '₹' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  }
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currencyCode: string = 'USD'): string {
  const match = FINANCIAL_CURRENCIES.find((c) => c.code === currencyCode);
  return match ? match.symbol : '$';
}

/**
 * Format number with thousand separators
 */
export function formatThousands(val: number | string): string {
  const parts = val.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Format timestamp to readable date/time
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDateFull(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
