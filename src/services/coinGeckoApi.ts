/**
 * CoinGecko API Service
 * Handles all interactions with the CoinGecko cryptocurrency data API.
 * Provides market data, coin details, and OHLC (candlestick) data.
 */

import axios from 'axios';
import type { Coin, CoinDetail, OHLCPoint } from '../types';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Optional API key for better rate limits (set in .env as VITE_COINGECKO_API_KEY)
const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY || '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: API_KEY ? { 'x-cg-demo-api-key': API_KEY } : {},
});

/**
 * Fetches the top 100 cryptocurrencies by market cap.
 * @returns Array of coin market data including price, volume, and changes
 */
export const fetchCoinsMarkets = async (): Promise<Coin[]> => {
  try {
    const response = await api.get<Coin[]>('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false,
      },
    });
    return response.data;
  } catch (error) {
    console.error('CoinGecko API error:', error);
    throw error;
  }
};

/** Delays execution for the specified milliseconds */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches detailed information for a specific coin.
 * Includes retry logic with exponential backoff for rate limit handling.
 * @param coinId - The CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
 * @param retries - Number of retry attempts on rate limit (default: 3)
 */
export const fetchCoinDetails = async (coinId: string, retries = 3): Promise<CoinDetail> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await api.get<CoinDetail>(`/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false,
        },
      });
      return response.data;
    } catch (error: any) {
      const isRateLimit = error?.response?.status === 429;
      const isLastAttempt = attempt === retries - 1;
      
      if (isRateLimit && !isLastAttempt) {
        // Wait before retrying (exponential backoff: 2s, 4s, 8s...)
        const waitTime = Math.pow(2, attempt + 1) * 1000;
        console.warn(`Rate limited for ${coinId}, retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
      
      console.error('CoinGecko API error for coin:', coinId, error);
      throw new Error(isRateLimit ? 'API rate limit reached. Please wait a moment and try again.' : 'Failed to load coin details');
    }
  }
  throw new Error('Failed to load coin details after multiple attempts');
};

/**
 * Fetches OHLC (Open, High, Low, Close) candlestick data for charting.
 * @param coinId - The CoinGecko coin ID
 * @param days - Time range: 1, 7, 14, 30, 90, 180, or 365 days
 * @returns Array of OHLC data points with timestamps
 */
export const fetchOHLC = async (
  coinId: string,
  days: 1 | 7 | 14 | 30 | 90 | 180 | 365 = 7
): Promise<OHLCPoint[]> => {
  try {
    const response = await api.get<[number, number, number, number, number][]>(
      `/coins/${coinId}/ohlc`,
      { params: { vs_currency: 'usd', days } }
    );
    return (response.data || []).map(([timestamp, open, high, low, close]) => ({
      timestamp,
      open,
      high,
      low,
      close,
    }));
  } catch (error) {
    console.error('CoinGecko OHLC error:', coinId, error);
    throw error;
  }
};
