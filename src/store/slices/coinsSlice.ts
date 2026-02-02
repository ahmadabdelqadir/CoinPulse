/**
 * Coins Slice
 * Manages the main cryptocurrency list fetched from CoinGecko.
 * Handles loading states, caching, and search filtering.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Coin } from '../../types';
import { fetchCoinsMarkets } from '../../services/coinGeckoApi';

interface CoinsState {
  coins: Coin[];
  filteredCoins: Coin[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  searchQuery: string;
}

const initialState: CoinsState = {
  coins: [],
  filteredCoins: [],
  loading: false,
  error: null,
  lastFetched: null,
  searchQuery: '',
};

export const fetchCoins = createAsyncThunk(
  'coins/fetchCoins',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCoinsMarkets();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch coins');
    }
  }
);

const coinsSlice = createSlice({
  name: 'coins',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      const query = action.payload.toLowerCase().trim();
      if (!query) {
        state.filteredCoins = state.coins;
      } else {
        state.filteredCoins = state.coins.filter(
          (coin) =>
            coin.name.toLowerCase().includes(query) ||
            coin.symbol.toLowerCase().includes(query)
        );
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoins.fulfilled, (state, action) => {
        state.loading = false;
        state.coins = action.payload;
        state.filteredCoins = action.payload;
        state.lastFetched = Date.now();
        // Re-apply search filter if there's an active query
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase().trim();
          state.filteredCoins = action.payload.filter(
            (coin: Coin) =>
              coin.name.toLowerCase().includes(query) ||
              coin.symbol.toLowerCase().includes(query)
          );
        }
      })
      .addCase(fetchCoins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery, clearError } = coinsSlice.actions;
export default coinsSlice.reducer;
