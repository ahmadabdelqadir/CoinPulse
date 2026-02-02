/**
 * Reports Slice
 * Manages real-time price data and OHLC chart data for the Reports page.
 * Coordinates data from both CryptoCompare (live prices, minute/hour OHLC)
 * and CoinGecko (daily OHLC) based on the selected time interval.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PriceHistory, OHLCPoint } from '../../types';
import { fetchMultiplePrices, fetchHistoMinute, fetchHistoHour } from '../../services/cryptoCompareApi';
import { fetchOHLC as fetchOHLCApi } from '../../services/coinGeckoApi';

type OHLCDays = 1 | 7 | 14 | 30 | 90 | 180 | 365;

/** Available chart time intervals */
export type ChartInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '7d' | '14d' | '30d';

interface ReportsState {
  priceHistory: PriceHistory;
  currentPrices: { [symbol: string]: number };
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  isPolling: boolean;
  /** Key = `${coinId}-${interval}` for both CoinGecko (1d,7d,14d,30d) and CryptoCompare (1m,5m,15m,30m,1h) */
  ohlcData: { [key: string]: { data: OHLCPoint[]; interval: ChartInterval } };
  ohlcLoading: { [key: string]: boolean };
}

const initialState: ReportsState = {
  priceHistory: {},
  currentPrices: {},
  loading: false,
  error: null,
  lastUpdated: null,
  isPolling: false,
  ohlcData: {},
  ohlcLoading: {},
};

// Maximum number of data points to keep per coin
const MAX_DATA_POINTS = 60;

export const fetchLivePrices = createAsyncThunk(
  'reports/fetchLivePrices',
  async (symbols: string[], { rejectWithValue }) => {
    if (symbols.length === 0) {
      return { prices: {}, timestamp: Date.now() };
    }

    try {
      const prices = await fetchMultiplePrices(symbols);
      return { prices, timestamp: Date.now() };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch prices'
      );
    }
  }
);

export const fetchOHLC = createAsyncThunk(
  'reports/fetchOHLC',
  async (
    { coinId, days }: { coinId: string; days: OHLCDays },
    { rejectWithValue }
  ) => {
    try {
      const data = await fetchOHLCApi(coinId, days);
      const interval = (days === 1 ? '1d' : days === 7 ? '7d' : days === 14 ? '14d' : '30d') as ChartInterval;
      return { key: `${coinId}-${interval}`, data, interval };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch OHLC'
      );
    }
  }
);

/** Unified chart OHLC: minute/hour from CryptoCompare, day from CoinGecko. */
export const fetchChartOHLC = createAsyncThunk(
  'reports/fetchChartOHLC',
  async (
    { coinId, symbol, interval }: { coinId: string; symbol: string; interval: ChartInterval },
    { rejectWithValue }
  ) => {
    const key = `${coinId}-${interval}`;
    try {
      if (interval === '1m' || interval === '5m' || interval === '15m' || interval === '30m') {
        const agg = interval === '1m' ? 1 : interval === '5m' ? 5 : interval === '15m' ? 15 : 30;
        const data = await fetchHistoMinute(symbol, agg as 1 | 5 | 15 | 30, 200);
        return { key, data, interval };
      }
      if (interval === '1h') {
        const data = await fetchHistoHour(symbol, 1, 168);
        return { key, data, interval };
      }
      const daysMap: Record<string, OHLCDays> = { '1d': 1, '7d': 7, '14d': 14, '30d': 30 };
      const days = daysMap[interval] ?? 7;
      const data = await fetchOHLCApi(coinId, days);
      return { key, data, interval };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch chart data'
      );
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.isPolling = action.payload;
    },
    clearHistory: (state) => {
      state.priceHistory = {};
      state.currentPrices = {};
      state.lastUpdated = null;
    },
    clearCoinHistory: (state, action: PayloadAction<string>) => {
      delete state.priceHistory[action.payload];
      delete state.currentPrices[action.payload];
    },
    clearOHLC: (state, action: PayloadAction<string>) => {
      Object.keys(state.ohlcData).forEach((k) => {
        if (k.startsWith(action.payload)) delete state.ohlcData[k];
      });
      Object.keys(state.ohlcLoading).forEach((k) => {
        if (k.startsWith(action.payload)) delete state.ohlcLoading[k];
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLivePrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLivePrices.fulfilled, (state, action) => {
        state.loading = false;
        const { prices, timestamp } = action.payload;

        // Build new objects so React sees new references and re-renders (real-time updates)
        const newCurrentPrices = { ...state.currentPrices };
        const newPriceHistory = { ...state.priceHistory };

        Object.entries(prices).forEach(([symbol, priceData]) => {
          const upperSymbol = symbol.toUpperCase();
          const price = priceData.USD;

          newCurrentPrices[upperSymbol] = price;

          const history = newPriceHistory[upperSymbol] ? [...newPriceHistory[upperSymbol]] : [];
          history.push({ timestamp, price });
          if (history.length > MAX_DATA_POINTS) {
            newPriceHistory[upperSymbol] = history.slice(-MAX_DATA_POINTS);
          } else {
            newPriceHistory[upperSymbol] = history;
          }
        });

        state.currentPrices = newCurrentPrices;
        state.priceHistory = newPriceHistory;
        state.lastUpdated = timestamp;
      })
      .addCase(fetchLivePrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOHLC.pending, (state, action) => {
        state.ohlcLoading[`${action.meta.arg.coinId}-${action.meta.arg.days === 1 ? '1d' : action.meta.arg.days === 7 ? '7d' : action.meta.arg.days === 14 ? '14d' : '30d'}`] = true;
      })
      .addCase(fetchOHLC.fulfilled, (state, action) => {
        const { key, data, interval } = action.payload;
        state.ohlcData[key] = { data, interval };
        state.ohlcLoading[key] = false;
      })
      .addCase(fetchOHLC.rejected, (state, action) => {
        if (action.meta.arg?.coinId) {
          const interval = action.meta.arg.days === 1 ? '1d' : action.meta.arg.days === 7 ? '7d' : action.meta.arg.days === 14 ? '14d' : '30d';
          state.ohlcLoading[`${action.meta.arg.coinId}-${interval}`] = false;
        }
      })
      .addCase(fetchChartOHLC.pending, (state, action) => {
        state.ohlcLoading[action.meta.arg.coinId + '-' + action.meta.arg.interval] = true;
      })
      .addCase(fetchChartOHLC.fulfilled, (state, action) => {
        const { key, data, interval } = action.payload;
        state.ohlcData[key] = { data, interval };
        state.ohlcLoading[key] = false;
      })
      .addCase(fetchChartOHLC.rejected, (state, action) => {
        if (action.meta.arg) state.ohlcLoading[action.meta.arg.coinId + '-' + action.meta.arg.interval] = false;
      });
  },
});

export const { setPolling, clearHistory, clearCoinHistory, clearOHLC } = reportsSlice.actions;
export default reportsSlice.reducer;
