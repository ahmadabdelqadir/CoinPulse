import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CachedCoinDetail, CoinDetail } from '../../types';
import { fetchCoinDetails } from '../../services/coinGeckoApi';
import type { RootState } from '../index';

interface CoinDetailsState {
  details: { [coinId: string]: CachedCoinDetail };
  loading: { [coinId: string]: boolean };
  error: { [coinId: string]: string | null };
}

const initialState: CoinDetailsState = {
  details: {},
  loading: {},
  error: {},
};

// TTL in milliseconds (2 minutes)
const CACHE_TTL = 2 * 60 * 1000;

export const fetchCoinDetail = createAsyncThunk(
  'coinDetails/fetchCoinDetail',
  async (coinId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const cachedDetail = state.coinDetails.details[coinId];

    // Check if we have cached data that's still valid
    if (cachedDetail && Date.now() - cachedDetail.timestamp < CACHE_TTL) {
      return { coinId, data: cachedDetail.data, fromCache: true };
    }

    try {
      const data = await fetchCoinDetails(coinId);
      return { coinId, data, fromCache: false };
    } catch (error) {
      return rejectWithValue({
        coinId,
        error: error instanceof Error ? error.message : 'Failed to fetch coin details',
      });
    }
  }
);

const coinDetailsSlice = createSlice({
  name: 'coinDetails',
  initialState,
  reducers: {
    clearCoinDetail: (state, action: PayloadAction<string>) => {
      delete state.details[action.payload];
      delete state.loading[action.payload];
      delete state.error[action.payload];
    },
    clearAllDetails: (state) => {
      state.details = {};
      state.loading = {};
      state.error = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoinDetail.pending, (state, action) => {
        state.loading[action.meta.arg] = true;
        state.error[action.meta.arg] = null;
      })
      .addCase(fetchCoinDetail.fulfilled, (state, action) => {
        const { coinId, data, fromCache } = action.payload;
        state.loading[coinId] = false;
        if (!fromCache) {
          state.details[coinId] = {
            data: data as CoinDetail,
            timestamp: Date.now(),
          };
        }
      })
      .addCase(fetchCoinDetail.rejected, (state, action) => {
        const payload = action.payload as { coinId: string; error: string };
        state.loading[payload.coinId] = false;
        state.error[payload.coinId] = payload.error;
      });
  },
});

export const { clearCoinDetail, clearAllDetails } = coinDetailsSlice.actions;
export default coinDetailsSlice.reducer;
