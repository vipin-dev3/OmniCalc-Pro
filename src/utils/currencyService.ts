import { CurrencyRate } from '../types/converter';

export const DEFAULT_CURRENCY_RATES: CurrencyRate[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', ratePerUSD: 1.0 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', ratePerUSD: 83.35 },
  { code: 'EUR', name: 'Euro', symbol: '€', ratePerUSD: 0.925 },
  { code: 'GBP', name: 'British Pound', symbol: '£', ratePerUSD: 0.792 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', ratePerUSD: 3.6725 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', ratePerUSD: 3.751 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', ratePerUSD: 154.5 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', ratePerUSD: 1.365 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', ratePerUSD: 1.52 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', ratePerUSD: 0.895 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', ratePerUSD: 7.235 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', ratePerUSD: 1.352 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', ratePerUSD: 1.685 },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', ratePerUSD: 0.308 },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', ratePerUSD: 3.64 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', ratePerUSD: 5.55 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', ratePerUSD: 18.2 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', ratePerUSD: 1380 },
];

export interface LiveRatesResult {
  success: boolean;
  rates?: CurrencyRate[];
  timestamp?: string;
  source?: string;
  error?: string;
}

const STORAGE_KEY_RATES = 'omni_calc_currencies';
const STORAGE_KEY_TIMESTAMP = 'omni_calc_currencies_timestamp';

/**
 * Get initial cached rates from LocalStorage or default fallback
 */
export function getSavedCurrencyRates(): CurrencyRate[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_RATES);
    if (saved) {
      const parsed = JSON.parse(saved) as CurrencyRate[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // LocalStorage parse error fallback
  }
  return DEFAULT_CURRENCY_RATES;
}

/**
 * Get the timestamp of the last live update
 */
export function getLastLiveUpdateTimestamp(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_TIMESTAMP);
  } catch {
    return null;
  }
}

/**
 * Save updated rates and timestamp to localStorage
 */
export function saveCurrencyRates(rates: CurrencyRate[], timestamp?: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(rates));
    if (timestamp) {
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, timestamp);
    }
  } catch {
    // LocalStorage write error fallback
  }
}

/**
 * Fetch real-time live currency exchange rates from Open Exchange API
 * (Free public open API with no API key requirement, CORS enabled)
 */
export async function fetchLiveExchangeRates(
  currentRatesList: CurrencyRate[] = DEFAULT_CURRENCY_RATES
): Promise<LiveRatesResult> {
  const primaryApi = 'https://open.er-api.com/v6/latest/USD';
  const fallbackApi = 'https://api.exchangerate-api.com/v4/latest/USD';

  // Helper to process API response
  const processRatesData = (data: { rates: Record<string, number>; time_last_update_utc?: string; date?: string }) => {
    if (!data || !data.rates) {
      throw new Error('Invalid rate data received');
    }

    const liveRatesObj = data.rates;
    const updatedRates: CurrencyRate[] = currentRatesList.map((item) => {
      const liveRate = liveRatesObj[item.code];
      if (typeof liveRate === 'number' && !isNaN(liveRate) && liveRate > 0) {
        return {
          ...item,
          ratePerUSD: Number(liveRate.toFixed(4)),
        };
      }
      return item;
    });

    // Capture readable timestamp
    let formattedTime = data.time_last_update_utc;
    if (!formattedTime && data.date) {
      formattedTime = new Date(data.date).toUTCString();
    }
    if (!formattedTime) {
      formattedTime = new Date().toUTCString();
    }

    saveCurrencyRates(updatedRates, formattedTime);

    return {
      success: true,
      rates: updatedRates,
      timestamp: formattedTime,
      source: 'Open Exchange Rates (Real-Time)',
    };
  };

  // Attempt 1: Open Exchange API v6
  try {
    const response = await fetch(primaryApi, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return processRatesData(data);
  } catch (err1) {
    // Attempt 2: Fallback API
    try {
      const fallbackResponse = await fetch(fallbackApi, { cache: 'no-cache' });
      if (!fallbackResponse.ok) throw new Error(`Fallback HTTP ${fallbackResponse.status}`);
      const fallbackData = await fallbackResponse.json();
      return processRatesData(fallbackData);
    } catch (err2) {
      return {
        success: false,
        error: 'Unable to reach currency server. Using locally saved rates.',
      };
    }
  }
}
