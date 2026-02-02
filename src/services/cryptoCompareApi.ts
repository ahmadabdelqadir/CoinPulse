/**
 * CryptoCompare API Service
 * Handles real-time price polling and minute/hour OHLC data.
 * More generous rate limits than CoinGecko for frequent polling.
 */

import axios from 'axios';
import type { CryptoComparePrices, OHLCPoint } from '../types';

const BASE_URL = 'https://min-api.cryptocompare.com/data';

// Optional API key (set in .env as VITE_CRYPTOCOMPARE_API_KEY)
const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY || '';

/**
 * Fetches current prices for multiple coins in a single API call.
 * Efficient batch request: 5 coins = 1 request instead of 5 separate calls.
 * @param symbols - Array of coin symbols (e.g., ['BTC', 'ETH', 'DOGE'])
 * @returns Object mapping symbols to their USD prices
 */
export const fetchMultiplePrices = async (
  symbols: string[]
): Promise<CryptoComparePrices> => {
  if (symbols.length === 0) {
    return {};
  }

  const fsyms = symbols.map((s) => s.toUpperCase()).join(',');

  const headers: Record<string, string> = {};
  if (API_KEY) {
    headers['authorization'] = `Apikey ${API_KEY}`;
  }

  try {
    const response = await axios.get<CryptoComparePrices>(`${BASE_URL}/pricemulti`, {
      params: {
        fsyms,
        tsyms: 'USD',
      },
      headers,
    });

    return response.data;
  } catch (error) {
    console.error('CryptoCompare API error:', error);
    return {};
  }
};

interface HistoMinuteResponse {
  Data?: { Data?: { time: number; open: number; high: number; low: number; close: number }[] };
}

/**
 * Fetches minute-level OHLC data for short-term charts.
 * @param symbol - Coin symbol (e.g., 'BTC')
 * @param aggregateMinutes - Candle size: 1, 5, 15, or 30 minutes
 * @param limit - Number of candles to fetch (max 2000, default 200)
 */
export const fetchHistoMinute = async (
  symbol: string,
  aggregateMinutes: 1 | 5 | 15 | 30 = 1,
  limit = 200
): Promise<OHLCPoint[]> => {
  const fsym = symbol.toUpperCase();
  const headers: Record<string, string> = {};
  if (API_KEY) headers['authorization'] = `Apikey ${API_KEY}`;
  const response = await axios.get<HistoMinuteResponse>(`${BASE_URL}/v2/histominute`, {
    params: { fsym, tsym: 'USD', limit, aggregate: aggregateMinutes },
    headers,
  });
  const arr = response.data?.Data?.Data ?? [];
  return arr.map((d) => ({
    timestamp: d.time * 1000,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }));
};

interface HistoHourResponse {
  Data?: { Data?: { time: number; open: number; high: number; low: number; close: number }[] };
}

/**
 * Fetches hourly OHLC data for medium-term charts.
 * @param symbol - Coin symbol (e.g., 'BTC')
 * @param aggregateHours - Candle size in hours (default: 1)
 * @param limit - Number of candles (default: 168 = 7 days)
 */
export const fetchHistoHour = async (
  symbol: string,
  aggregateHours = 1,
  limit = 168
): Promise<OHLCPoint[]> => {
  const fsym = symbol.toUpperCase();
  const headers: Record<string, string> = {};
  if (API_KEY) headers['authorization'] = `Apikey ${API_KEY}`;
  const response = await axios.get<HistoHourResponse>(`${BASE_URL}/v2/histohour`, {
    params: { fsym, tsym: 'USD', limit, aggregate: aggregateHours },
    headers,
  });
  const arr = response.data?.Data?.Data ?? [];
  return arr.map((d) => ({
    timestamp: d.time * 1000,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }));
};
