import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AIRecommendation, AIRequestPayload } from '../../types';
import { getAIRecommendation } from '../../services/openAiApi';
import { fetchCoinDetails } from '../../services/coinGeckoApi';

interface AIState {
  recommendations: { [coinId: string]: AIRecommendation };
  loading: { [coinId: string]: boolean };
  error: { [coinId: string]: string | null };
}

const initialState: AIState = {
  recommendations: {},
  loading: {},
  error: {},
};

export const fetchAIRecommendation = createAsyncThunk(
  'ai/fetchRecommendation',
  async (coinId: string, { rejectWithValue }) => {
    try {
      // First, fetch the coin details from CoinGecko
      const coinData = await fetchCoinDetails(coinId);

      // Build the payload for AI
      const payload: AIRequestPayload = {
        name: coinData.name,
        current_price_usd: coinData.market_data.current_price.usd,
        market_cap_usd: coinData.market_data.market_cap.usd,
        volume_24h_usd: coinData.market_data.total_volume.usd,
        price_change_percentage_30d_in_currency:
          coinData.market_data.price_change_percentage_30d_in_currency?.usd ??
          coinData.market_data.price_change_percentage_30d ??
          null,
        price_change_percentage_60d_in_currency:
          coinData.market_data.price_change_percentage_60d_in_currency?.usd ??
          coinData.market_data.price_change_percentage_60d ??
          null,
        price_change_percentage_200d_in_currency:
          coinData.market_data.price_change_percentage_200d_in_currency?.usd ??
          coinData.market_data.price_change_percentage_200d ??
          null,
      };

      // Get AI recommendation
      const recommendation = await getAIRecommendation(payload);

      return {
        coinId,
        recommendation: {
          coinId,
          decision: recommendation.decision,
          confidence: recommendation.confidence,
          explanation: recommendation.explanation,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      return rejectWithValue({
        coinId,
        error: error instanceof Error ? error.message : 'Failed to get AI recommendation',
      });
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearRecommendation: (state, action: PayloadAction<string>) => {
      delete state.recommendations[action.payload];
      delete state.loading[action.payload];
      delete state.error[action.payload];
    },
    clearAllRecommendations: (state) => {
      state.recommendations = {};
      state.loading = {};
      state.error = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIRecommendation.pending, (state, action) => {
        state.loading[action.meta.arg] = true;
        state.error[action.meta.arg] = null;
      })
      .addCase(fetchAIRecommendation.fulfilled, (state, action) => {
        const { coinId, recommendation } = action.payload;
        state.loading[coinId] = false;
        state.recommendations[coinId] = recommendation;
      })
      .addCase(fetchAIRecommendation.rejected, (state, action) => {
        const payload = action.payload as { coinId: string; error: string };
        state.loading[payload.coinId] = false;
        state.error[payload.coinId] = payload.error;
      });
  },
});

export const { clearRecommendation, clearAllRecommendations } = aiSlice.actions;
export default aiSlice.reducer;
